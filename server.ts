import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("evalit.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    question_paper_text TEXT,
    answer_key_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL -- 'admin' or 'evaluator'
  );

  CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    pdf_base64 TEXT NOT NULL,
    assigned_to TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'evaluating', 'completed'
    marks_json TEXT,
    digitized_text_json TEXT,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
  );

  -- Insert default users for testing
  INSERT OR IGNORE INTO users (id, name, role) VALUES ('admin1', 'Super Admin', 'admin');
  INSERT OR IGNORE INTO users (id, name, role) VALUES ('eval1', 'John Doe', 'evaluator');
  INSERT OR IGNORE INTO users (id, name, role) VALUES ('eval2', 'Jane Smith', 'evaluator');
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  
  // Get all evaluators
  app.get("/api/evaluators", (req, res) => {
    const evaluators = db.prepare("SELECT * FROM users WHERE role = 'evaluator'").all();
    res.json(evaluators);
  });

  // Get all exams
  app.get("/api/exams", (req, res) => {
    const exams = db.prepare("SELECT * FROM exams ORDER BY created_at DESC").all();
    res.json(exams);
  });

  // Create an exam
  app.post("/api/exams", (req, res) => {
    const { id, title, question_paper_text, answer_key_json } = req.body;
    db.prepare("INSERT INTO exams (id, title, question_paper_text, answer_key_json) VALUES (?, ?, ?, ?)").run(id, title, question_paper_text, answer_key_json);
    res.json({ success: true });
  });

  // Upload answer sheets (bulk)
  app.post("/api/papers/bulk", (req, res) => {
    const { exam_id, papers } = req.body;
    const insert = db.prepare("INSERT INTO papers (id, exam_id, student_name, pdf_base64) VALUES (?, ?, ?, ?)");
    const transaction = db.transaction((papersList) => {
      for (const p of papersList) {
        insert.run(p.id, exam_id, p.student_name, p.pdf_base64);
      }
    });
    transaction(papers);
    res.json({ success: true });
  });

  // Distribute papers equally
  app.post("/api/papers/distribute", (req, res) => {
    const { exam_id } = req.body;
    const evaluators = db.prepare("SELECT id FROM users WHERE role = 'evaluator'").all() as { id: string }[];
    const papers = db.prepare("SELECT id FROM papers WHERE exam_id = ? AND assigned_to IS NULL").all(exam_id) as { id: string }[];

    if (evaluators.length === 0) return res.status(400).json({ error: "No evaluators available" });

    const transaction = db.transaction(() => {
      papers.forEach((p, index) => {
        const evalId = evaluators[index % evaluators.length].id;
        db.prepare("UPDATE papers SET assigned_to = ? WHERE id = ?").run(evalId, p.id);
      });
    });
    transaction();
    res.json({ success: true });
  });

  // Get papers assigned to an evaluator
  app.get("/api/evaluator/:userId/papers", (req, res) => {
    const { userId } = req.params;
    const papers = db.prepare(`
      SELECT p.*, e.title as exam_title, e.answer_key_json 
      FROM papers p 
      JOIN exams e ON p.exam_id = e.id 
      WHERE p.assigned_to = ?
    `).all(userId);
    res.json(papers);
  });

  // Update paper evaluation
  app.post("/api/papers/:paperId/evaluate", (req, res) => {
    const { paperId } = req.params;
    const { marks_json, sterilized_text_json, status } = req.body;
    db.prepare("UPDATE papers SET marks_json = ?, digitized_text_json = ?, status = ? WHERE id = ?")
      .run(marks_json, sterilized_text_json, status, paperId);
    res.json({ success: true });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
