import { Exam, Paper, User } from "../types";

export const api = {
  getEvaluators: async (): Promise<User[]> => {
    const res = await fetch("/api/evaluators");
    return res.json();
  },
  getExams: async (): Promise<Exam[]> => {
    const res = await fetch("/api/exams");
    return res.json();
  },
  createExam: async (exam: Partial<Exam>) => {
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exam),
    });
    return res.json();
  },
  uploadPapers: async (examId: string, papers: { id: string; student_name: string; pdf_base64: string }[]) => {
    const res = await fetch("/api/papers/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam_id: examId, papers }),
    });
    return res.json();
  },
  distributePapers: async (examId: string) => {
    const res = await fetch("/api/papers/distribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam_id: examId }),
    });
    return res.json();
  },
  getEvaluatorPapers: async (userId: string): Promise<Paper[]> => {
    const res = await fetch(`/api/evaluator/${userId}/papers`);
    return res.json();
  },
  updatePaperEvaluation: async (paperId: string, data: { marks_json: string; digitized_text_json: string; status: string }) => {
    const res = await fetch(`/api/papers/${paperId}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
