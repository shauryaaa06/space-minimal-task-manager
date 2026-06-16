import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Target, BarChart2, Flame, CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import { formatDuration, playSound } from '../utils';
import type { Task } from '../types';

type TimerMode = 'focus' | 'break' | 'longBreak';
type TimerState = 'idle' | 'running' | 'paused';

export default function FocusPage() {
  const { user, getUserTasks, addFocusSession, focusSessions } = useStore();
  const settings = user?.settings;

  const FOCUS_TIME = (settings?.focusDuration ?? 25) * 60;
  const BREAK_TIME = (settings?.breakDuration ?? 5) * 60;
  const LONG_BREAK_TIME = (settings?.longBreakDuration ?? 15) * 60;
  const LONG_BREAK_INTERVAL = settings?.longBreakInterval ?? 4;

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const incompleteTasks = getUserTasks().filter(t => !t.completed);

  const totalTime = mode === 'focus' ? FOCUS_TIME : mode === 'break' ? BREAK_TIME : LONG_BREAK_TIME;
  const progress = 1 - timeLeft / totalTime;
  const circumference = 2 * Math.PI * 110;

  const todaysSessions = focusSessions.filter(s => {
    const today = new Date().toDateString();
    return new Date(s.completedAt).toDateString() === today;
  });
  const todaysFocusTime = todaysSessions.filter(s => s.type === 'focus').reduce((sum, s) => sum + s.duration, 0);
  const totalFocusTime = focusSessions.filter(s => s.type === 'focus').reduce((sum, s) => sum + s.duration, 0);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState('idle');
  }, []);

  const handleSessionComplete = useCallback(() => {
    stop();
    if (settings?.soundEnabled !== false) playSound(mode === 'focus' ? 'complete' : 'break');

    addFocusSession({
      taskId: selectedTask?.id,
      duration: totalTime - timeLeft,
      type: mode,
      completedAt: new Date().toISOString(),
      interrupted: false,
    });

    if (mode === 'focus') {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      if (newCount % LONG_BREAK_INTERVAL === 0) {
        setMode('longBreak');
        setTimeLeft(LONG_BREAK_TIME);
      } else {
        setMode('break');
        setTimeLeft(BREAK_TIME);
      }
    } else {
      setMode('focus');
      setTimeLeft(FOCUS_TIME);
    }
  }, [mode, stop, addFocusSession, selectedTask, totalTime, timeLeft, sessionsCompleted, settings, FOCUS_TIME, BREAK_TIME, LONG_BREAK_TIME, LONG_BREAK_INTERVAL]);

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleSessionComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerState, handleSessionComplete]);

  const start = () => {
    startTimeRef.current = Date.now();
    setTimerState('running');
  };

  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState('paused');
  };

  const reset = () => {
    stop();
    setTimeLeft(totalTime);
  };

  const skip = () => {
    stop();
    if (mode === 'focus') {
      setMode('break');
      setTimeLeft(BREAK_TIME);
    } else {
      setMode('focus');
      setTimeLeft(FOCUS_TIME);
    }
  };

  const switchMode = (m: TimerMode) => {
    stop();
    setMode(m);
    setTimeLeft(m === 'focus' ? FOCUS_TIME : m === 'break' ? BREAK_TIME : LONG_BREAK_TIME);
  };

  const modeColors = {
    focus: 'var(--accent-500)',
    break: '#22c55e',
    longBreak: '#8b5cf6',
  };

  const modeLabels = {
    focus: 'Focus',
    break: 'Short Break',
    longBreak: 'Long Break',
  };

  const color = modeColors[mode];

  return (
    <div style={{ paddingBottom: 'calc(80px + 24px)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Focus</h1>
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <BarChart2 className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Stats */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-3 gap-3 overflow-hidden"
            >
              {[
                { label: "Today's Focus", value: `${Math.floor(todaysFocusTime / 60)}m`, icon: '🎯' },
                { label: 'Sessions', value: todaysSessions.filter(s => s.type === 'focus').length.toString(), icon: '✅' },
                { label: 'Total Hours', value: `${Math.floor(totalFocusTime / 3600)}h`, icon: '⏱️' },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-2xl text-center"
                  style={{ background: 'var(--bg-secondary)' }}>
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mode Switcher */}
      <div className="px-5 mb-6">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
          {([['focus', 'Focus'], ['break', 'Short Break'], ['longBreak', 'Long Break']] as [TimerMode, string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: mode === m ? modeColors[m] : 'transparent',
                color: mode === m ? 'white' : 'var(--text-tertiary)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Timer Ring */}
      <div className="flex flex-col items-center px-5 mb-8">
        <div className="relative w-64 h-64">
          <svg className="w-64 h-64 progress-ring" viewBox="0 0 264 264">
            {/* Background track */}
            <circle cx="132" cy="132" r="110" fill="none"
              stroke="var(--bg-tertiary)" strokeWidth="12" />
            {/* Progress arc */}
            <circle cx="132" cy="132" r="110" fill="none"
              stroke={color} strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="timer-ring"
              style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
            />
          </svg>

          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {formatDuration(timeLeft)}
            </span>
            <span className="text-sm font-medium mt-1" style={{ color: modeColors[mode] }}>
              {modeLabels[mode]}
            </span>
            {selectedTask && (
              <span className="text-xs mt-2 px-3 text-center max-w-[180px] truncate"
                style={{ color: 'var(--text-tertiary)' }}>
                {selectedTask.title}
              </span>
            )}
          </div>
        </div>

        {/* Session Dots */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: LONG_BREAK_INTERVAL }, (_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full transition-all"
              style={{
                background: i < (sessionsCompleted % LONG_BREAK_INTERVAL) ? color : 'var(--bg-tertiary)',
                transform: i < (sessionsCompleted % LONG_BREAK_INTERVAL) ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
          {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} today
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 px-5 mb-8">
        <button onClick={reset} className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--bg-secondary)' }}>
          <RotateCcw className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>

        {/* Play/Pause */}
        <motion.button
          onClick={timerState === 'running' ? pause : start}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            boxShadow: `0 8px 24px ${color}40`,
          }}
        >
          {timerState === 'running'
            ? <Pause className="w-8 h-8 text-white" />
            : <Play className="w-8 h-8 text-white" style={{ marginLeft: '3px' }} />
          }
        </motion.button>

        <button onClick={skip} className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--bg-secondary)' }}>
          <SkipForward className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Task Selector */}
      <div className="px-5 mb-6">
        <button
          onClick={() => setShowTaskPicker(!showTaskPicker)}
          className="w-full p-4 rounded-2xl text-left flex items-center gap-3"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <Target className="w-5 h-5 flex-shrink-0" style={{ color: color }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>FOCUSING ON</p>
            <p className="text-sm font-medium truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {selectedTask ? selectedTask.title : 'Select a task...'}
            </p>
          </div>
        </button>

        <AnimatePresence>
          {showTaskPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 rounded-2xl overflow-hidden border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={() => { setSelectedTask(null); setShowTaskPicker(false); }}
                className="w-full p-4 text-left text-sm border-b"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
              >
                No specific task
              </button>
              {incompleteTasks.slice(0, 8).map(task => (
                <button
                  key={task.id}
                  onClick={() => { setSelectedTask(task); setShowTaskPicker(false); }}
                  className="w-full p-4 text-left border-b last:border-0 flex items-center justify-between"
                  style={{
                    background: selectedTask?.id === task.id ? `${color}10` : 'transparent',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
                  {selectedTask?.id === task.id && (
                    <CheckCircle className="w-4 h-4" style={{ color: color }} />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <div className="px-5">
        <div className="p-4 rounded-2xl" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4" style={{ color }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {mode === 'focus' ? 'Stay in the zone' : 'Take a real break'}
            </p>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'focus'
              ? 'Put your phone down. Close unnecessary tabs. Focus entirely on your chosen task.'
              : 'Step away from your screen. Stretch, breathe, or grab some water.'}
          </p>
        </div>
      </div>

      {/* Previous Sessions */}
      {todaysSessions.length > 0 && (
        <div className="px-5 mt-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>TODAY'S SESSIONS</h3>
          <div className="space-y-2">
            {todaysSessions.slice(-5).reverse().map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{
                    background: session.type === 'focus' ? color : session.type === 'break' ? '#22c55e' : '#8b5cf6'
                  }} />
                  <span className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                    {session.type === 'longBreak' ? 'Long Break' : session.type}
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {Math.round(session.duration / 60)}m
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
