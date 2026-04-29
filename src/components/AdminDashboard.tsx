import { useState, useEffect } from 'react';
import { User, Exam, AnswerKeySection } from '../types';
import { api } from '../services/api';
import { Plus, FileText, Upload, Users, CheckCircle, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard({ user }: { user: User }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [answerKey, setAnswerKey] = useState<AnswerKeySection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    const data = await api.getExams();
    setExams(data);
  };

  const addQuestionToKey = () => {
    const num = answerKey.length + 1;
    setAnswerKey([...answerKey, { 
      id: Math.random().toString(36).substr(2, 9),
      questionNumber: `Q${num}`,
      points: [''],
      maxMarks: 5
    }]);
  };

  const handleCreateExam = async () => {
    if (!newExamTitle) return;
    setLoading(true);
    try {
      await api.createExam({
        id: 'exam_' + Date.now(),
        title: newExamTitle,
        answer_key_json: JSON.stringify(answerKey)
      });
      setNewExamTitle('');
      setAnswerKey([]);
      setShowCreate(false);
      loadExams();
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (examId: string, files: FileList | null) => {
    if (!files) return;
    setLoading(true);
    try {
      const papers = await Promise.all(
        Array.from(files).map(async (file) => {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          return {
            id: 'paper_' + Math.random().toString(36).substr(2, 9),
            student_name: file.name.replace('.pdf', ''),
            pdf_base64: base64
          };
        })
      );
      await api.uploadPapers(examId, papers);
      alert('Papers uploaded successfully');
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async (examId: string) => {
    setLoading(true);
    try {
      await api.distributePapers(examId);
      alert('Papers distributed equally among evaluators');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif italic">Administrator Overview</h2>
          <p className="text-zinc-500 text-sm">Manage exams, answer keys, and distribution</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          {showCreate ? 'Discard' : <><Plus className="w-4 h-4" /> Create New Exam</>}
        </button>
      </div>

      {showCreate && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-200 p-8 shadow-sm"
        >
          <div className="max-w-3xl space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2">Exam Title</label>
              <input 
                type="text" 
                value={newExamTitle}
                onChange={(e) => setNewExamTitle(e.target.value)}
                placeholder="e.g. Mathematics Mid-Term 2024"
                className="w-full p-3 border border-zinc-200 focus:border-zinc-900 outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Answer Key Construction</label>
                <button 
                  onClick={addQuestionToKey}
                  className="text-xs font-medium text-zinc-900 hover:underline"
                >
                  + Add Question
                </button>
              </div>
              
              <div className="space-y-4">
                {answerKey.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-zinc-50 border border-zinc-100 flex gap-4">
                    <div className="w-20">
                      <input 
                        type="text" 
                        value={q.questionNumber}
                        onChange={(e) => {
                          const newKey = [...answerKey];
                          newKey[idx].questionNumber = e.target.value;
                          setAnswerKey(newKey);
                        }}
                        className="w-full p-2 text-sm font-bold border border-transparent focus:border-zinc-200 bg-transparent"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      {q.points.map((p, pIdx) => (
                        <input 
                          key={pIdx}
                          type="text"
                          value={p}
                          onChange={(e) => {
                            const newKey = [...answerKey];
                            newKey[idx].points[pIdx] = e.target.value;
                            setAnswerKey(newKey);
                          }}
                          placeholder={`Key point ${pIdx + 1}`}
                          className="w-full p-2 text-sm border border-zinc-200 focus:border-zinc-900 outline-none"
                        />
                      ))}
                      <button 
                        onClick={() => {
                          const newKey = [...answerKey];
                          newKey[idx].points.push('');
                          setAnswerKey(newKey);
                        }}
                        className="text-[10px] uppercase font-bold text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        + Add Point
                      </button>
                    </div>
                    <div className="w-24">
                      <label className="block text-[9px] uppercase text-zinc-400 mb-1">Max Marks</label>
                      <input 
                        type="number"
                        value={q.maxMarks}
                        onChange={(e) => {
                          const newKey = [...answerKey];
                          newKey[idx].maxMarks = parseInt(e.target.value);
                          setAnswerKey(newKey);
                        }}
                        className="w-full p-2 text-sm border border-zinc-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleCreateExam}
              disabled={loading || !newExamTitle}
              className="w-full py-3 bg-zinc-900 text-white font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Initialize Exam & Store Answer Key'}
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white border border-zinc-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <FileText className="w-8 h-8 text-zinc-200" />
                <span className="text-[10px] font-mono text-zinc-400">{new Date(exam.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-medium mb-1">{exam.title}</h3>
              <p className="text-xs text-zinc-500 mb-6 uppercase tracking-widest">
                {JSON.parse(exam.answer_key_json).length} Questions Configured
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-zinc-50">
              <label className="flex items-center justify-center gap-2 px-3 py-2 border border-zinc-200 text-xs font-medium cursor-pointer hover:bg-zinc-50">
                <Upload className="w-3 h-3" />
                Upload Papers
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleBulkUpload(exam.id, e.target.files)}
                />
              </label>
              <button 
                onClick={() => handleDistribute(exam.id)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-50 text-xs font-medium hover:bg-zinc-100"
              >
                <Users className="w-3 h-3" />
                Distribute
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
