/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, UserRole, User as UserType } from './types';
import { api } from './services/api';
import AdminDashboard from './components/AdminDashboard';
import EvaluatorDashboard from './components/EvaluatorDashboard';
import { LogIn, GraduationCap, ShieldCheck, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const evaluators = await api.getEvaluators();
        const admins = [{ id: 'admin1', name: 'Super Admin', role: UserRole.ADMIN }];
        setAllUsers([...admins, ...evaluators]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return <div className="h-screen w-full flex items-center justify-center font-mono text-zinc-500">Initializing EvalIt...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-zinc-900" />
            <h1 className="text-3xl font-serif italic mb-2">EvalIt</h1>
            <p className="text-zinc-500 font-sans text-sm uppercase tracking-widest font-medium">Digital Evaluation Platform</p>
          </div>

          <div className="bg-white border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-lg font-medium mb-6 text-zinc-800">Select Identity to Start</h2>
            <div className="space-y-3">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setUser(u)}
                  className="w-full text-left p-4 border border-zinc-100 hover:border-zinc-900 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {u.role === UserRole.ADMIN ? <ShieldCheck className="w-5 h-5 text-zinc-400" /> : <UserIcon className="w-5 h-5 text-zinc-400" />}
                    <div>
                      <div className="font-medium text-zinc-900">{u.name}</div>
                      <div className="text-xs text-zinc-400 uppercase tracking-tighter">{u.role}</div>
                    </div>
                  </div>
                  <LogIn className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-zinc-900">
      <header className="border-bottom border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6" />
            <span className="font-serif italic text-xl">EvalIt</span>
            <span className="h-4 w-[1px] bg-zinc-200 mx-2" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">{user.role} workspace</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{user.name}</div>
              <button 
                onClick={() => setUser(null)}
                className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {user.role === UserRole.ADMIN ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <AdminDashboard user={user} />
            </motion.div>
          ) : (
            <motion.div
              key="eval"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <EvaluatorDashboard user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

