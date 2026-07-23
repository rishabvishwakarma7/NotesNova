'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, Loader2, CheckCircle2, XCircle, ArrowRight,
  ArrowLeft, Trophy, RotateCcw, Plus, Clock, Target, Zap,
  ChevronRight, Trash2,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';

const difficulties = [
  { id: 'easy', label: 'Easy', color: '#10B981', icon: Zap },
  { id: 'medium', label: 'Medium', color: '#F59E0B', icon: Target },
  { id: 'hard', label: 'Hard', color: '#F43F5E', icon: Brain },
];

export default function QuizPage() {
  const [view, setView] = useState('create'); // create | quiz | results | history
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/quiz');
      setHistory(res.data || []);
    } catch { setHistory([]); }
    setLoadingHistory(false);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/quiz/generate', { topic, subject, questionCount, difficulty });
      setQuiz(res.data);
      setCurrentQ(0);
      setAnswers(new Array(res.data.questions.length).fill(-1));
      setSelectedOption(null);
      setShowAnswer(false);
      setView('quiz');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate quiz');
    }
    setLoading(false);
  };

  const handleSelectOption = (optIdx) => {
    if (showAnswer) return;
    setSelectedOption(optIdx);
  };

  const handleConfirm = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = selectedOption;
    setAnswers(newAnswers);
    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setSelectedOption(null);
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post(`/quiz/${quiz._id}/submit`, { answers });
      setResults(res.data);
      setView('results');
      loadHistory();
    } catch {
      // Calculate locally
      let score = 0;
      quiz.questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) score++;
      });
      setResults({ score, total: quiz.questions.length });
      setView('results');
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setSelectedOption(null);
    setShowAnswer(false);
    setResults(null);
    setView('quiz');
  };

  const handleNewQuiz = () => {
    setQuiz(null);
    setResults(null);
    setTopic('');
    setSubject('');
    setView('create');
  };

  const handleDeleteQuiz = async (id) => {
    try {
      await api.delete(`/quiz/${id}`);
      setHistory(history.filter(h => h._id !== id));
    } catch {}
  };

  const handleLoadQuiz = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/quiz/${id}`);
      setQuiz(res.data);
      setCurrentQ(0);
      setAnswers(new Array(res.data.questions.length).fill(-1));
      setSelectedOption(null);
      setShowAnswer(false);
      setView('quiz');
    } catch {
      alert('Failed to load quiz');
    }
    setLoading(false);
  };

  // ────── CREATE VIEW ──────
  if (view === 'create') {
    return (
      <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            <Brain size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />
            AI Quiz Generator
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            Generate interactive quizzes from any topic and test your knowledge.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Create form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard style={{ padding: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                Create New Quiz
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Topic *</label>
                  <input
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g., Cell Biology, React Hooks, World War II..."
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Subject (optional)</label>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g., Biology, Computer Science..."
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                    Questions: {questionCount}
                  </label>
                  <input
                    type="range" min={5} max={20} value={questionCount}
                    onChange={e => setQuestionCount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#8B5CF6' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Difficulty</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {difficulties.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setDifficulty(d.id)}
                        style={{
                          flex: 1, padding: '10px 14px', borderRadius: 10,
                          background: difficulty === d.id ? `${d.color}15` : 'var(--bg-glass)',
                          border: `1px solid ${difficulty === d.id ? d.color + '40' : 'var(--border-color)'}`,
                          color: difficulty === d.id ? d.color : 'var(--text-secondary)',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          transition: 'all 0.2s',
                        }}
                      >
                        <d.icon size={14} /> {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || loading}
                  className="btn-primary"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: 15, padding: '14px 32px', marginTop: 8,
                    opacity: topic.trim() ? 1 : 0.5, width: '100%',
                  }}
                >
                  {loading
                    ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
                    : <><Sparkles size={18} /> Generate Quiz</>
                  }
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </button>
              </div>
            </GlassCard>
          </motion.div>

          {/* History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard style={{ padding: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                <Clock size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                Quiz History
              </h2>

              {loadingHistory ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
                </div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <Brain size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p>No quizzes yet. Create your first one!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                  {history.map(h => (
                    <div
                      key={h._id}
                      onClick={() => handleLoadQuiz(h._id)}
                      style={{
                        padding: '14px 16px', borderRadius: 12,
                        background: 'var(--bg-tertiary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.2s', border: '1px solid transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-glow)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                          {h.title}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {h.questionCount} questions • {h.difficulty} • {h.attemptCount} attempts
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {h.bestScore !== null && (
                          <span style={{
                            padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                            background: h.bestScore >= 80 ? 'rgba(16,185,129,0.15)' : h.bestScore >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)',
                            color: h.bestScore >= 80 ? '#10B981' : h.bestScore >= 50 ? '#F59E0B' : '#F43F5E',
                          }}>
                            {h.bestScore}%
                          </span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteQuiz(h._id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                        >
                          <Trash2 size={14} />
                        </button>
                        <ChevronRight size={16} color="var(--text-muted)" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  // ────── QUIZ VIEW ──────
  if (view === 'quiz' && quiz) {
    const q = quiz.questions[currentQ];
    const progress = ((currentQ + (showAnswer ? 1 : 0)) / quiz.questions.length) * 100;

    return (
      <div style={{ padding: '32px 24px', maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <button onClick={handleNewQuiz} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 14,
          }}>
            <ArrowLeft size={16} /> Exit Quiz
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {currentQ + 1} / {quiz.questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', marginBottom: 32, overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: 3,
              background: 'var(--gradient-primary)',
            }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard style={{ padding: 32, marginBottom: 24 }}>
              <h2 style={{
                fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
                lineHeight: 1.5, marginBottom: 28,
              }}>
                {q.question}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {q.options.map((opt, idx) => {
                  let bg = 'var(--bg-tertiary)';
                  let border = 'var(--border-color)';
                  let color = 'var(--text-primary)';

                  if (showAnswer) {
                    if (idx === q.correctAnswer) {
                      bg = 'rgba(16, 185, 129, 0.12)';
                      border = '#10B981';
                      color = '#10B981';
                    } else if (idx === selectedOption && idx !== q.correctAnswer) {
                      bg = 'rgba(244, 63, 94, 0.12)';
                      border = '#F43F5E';
                      color = '#F43F5E';
                    }
                  } else if (idx === selectedOption) {
                    bg = 'rgba(139, 92, 246, 0.12)';
                    border = '#8B5CF6';
                    color = '#A78BFA';
                  }

                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      whileHover={!showAnswer ? { scale: 1.01 } : {}}
                      whileTap={!showAnswer ? { scale: 0.99 } : {}}
                      style={{
                        padding: '16px 20px', borderRadius: 14,
                        background: bg, border: `1.5px solid ${border}`,
                        color, fontSize: 15, fontWeight: 500,
                        cursor: showAnswer ? 'default' : 'pointer',
                        textAlign: 'left', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 12,
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700,
                        background: idx === selectedOption && !showAnswer ? 'rgba(139,92,246,0.2)' :
                          showAnswer && idx === q.correctAnswer ? 'rgba(16,185,129,0.2)' :
                          showAnswer && idx === selectedOption ? 'rgba(244,63,94,0.2)' : 'var(--bg-glass)',
                      }}>
                        {showAnswer && idx === q.correctAnswer ? <CheckCircle2 size={16} /> :
                         showAnswer && idx === selectedOption ? <XCircle size={16} /> :
                         String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showAnswer && q.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      marginTop: 20, padding: '16px 20px', borderRadius: 12,
                      background: 'rgba(139, 92, 246, 0.08)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#A78BFA', marginBottom: 4 }}>💡 Explanation</p>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              {!showAnswer ? (
                <button
                  onClick={handleConfirm}
                  disabled={selectedOption === null}
                  className="btn-primary"
                  style={{
                    padding: '12px 28px', fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                    opacity: selectedOption !== null ? 1 : 0.5,
                  }}
                >
                  Confirm Answer <CheckCircle2 size={16} />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn-primary"
                  style={{
                    padding: '12px 28px', fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {currentQ < quiz.questions.length - 1 ? <>Next Question <ArrowRight size={16} /></> : <>See Results <Trophy size={16} /></>}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ────── RESULTS VIEW ──────
  if (view === 'results' && results && quiz) {
    const percentage = Math.round((results.score / results.total) * 100);
    const isGreat = percentage >= 80;
    const isOk = percentage >= 50;

    return (
      <div style={{ padding: '32px 24px', maxWidth: 700, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <GlassCard style={{ padding: 48 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
              style={{
                width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px',
                background: isGreat ? 'rgba(16,185,129,0.15)' : isOk ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Trophy size={44} color={isGreat ? '#10B981' : isOk ? '#F59E0B' : '#F43F5E'} />
            </motion.div>

            <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>
              <span style={{ color: isGreat ? '#10B981' : isOk ? '#F59E0B' : '#F43F5E' }}>
                {percentage}%
              </span>
            </h1>
            <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              {isGreat ? '🎉 Excellent work!' : isOk ? '👍 Good effort!' : '📚 Keep studying!'}
            </p>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
              You scored {results.score} out of {results.total} questions
            </p>
          </GlassCard>
        </motion.div>

        {/* Question review */}
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          Question Review
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {quiz.questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctAnswer;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <GlassCard style={{ padding: 20 }} hover={false}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: 2,
                    }}>
                      {isCorrect ? <CheckCircle2 size={16} color="#10B981" /> : <XCircle size={16} color="#F43F5E" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                        {q.question}
                      </p>
                      {!isCorrect && (
                        <p style={{ fontSize: 13, color: '#F43F5E', marginBottom: 4 }}>
                          Your answer: {q.options[answers[i]] || 'Skipped'}
                        </p>
                      )}
                      <p style={{ fontSize: 13, color: '#10B981' }}>
                        Correct: {q.options[q.correctAnswer]}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={handleRetry} className="btn-secondary" style={{
            padding: '12px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <RotateCcw size={16} /> Retry Quiz
          </button>
          <button onClick={handleNewQuiz} className="btn-primary" style={{
            padding: '12px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Plus size={16} /> New Quiz
          </button>
        </div>
      </div>
    );
  }

  return null;
}
