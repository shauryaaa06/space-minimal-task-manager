import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Clock, Flag } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  isSameMonth, addMonths, subMonths, addWeeks, subWeeks,
  startOfWeek, endOfWeek, addDays, isToday, parseISO
} from 'date-fns';
import { useStore } from '../store';
import { getPriorityColor, formatTime } from '../utils';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import type { Task } from '../types';

type CalendarView = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { getUserTasks, groups } = useStore();
  const allTasks = getUserTasks();

  const getTasksForDate = (date: Date) =>
    allTasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), date));

  const navigate = (dir: 1 | -1) => {
    if (view === 'month') setCurrentDate(d => dir === 1 ? addMonths(d, 1) : subMonths(d, 1));
    else if (view === 'week') setCurrentDate(d => dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1));
    else setCurrentDate(d => dir === 1 ? addDays(d, 1) : addDays(d, -1));
  };

  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  // Month view data
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Week view data
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const selectedDateTasks = getTasksForDate(selectedDate);
  const incompleteTasks = selectedDateTasks.filter(t => !t.completed);
  const completedTasks = selectedDateTasks.filter(t => t.completed);

  const defaultDueDate = format(selectedDate, 'yyyy-MM-dd');

  const TaskChip = ({ task }: { task: Task }) => {
    const group = task.groupId ? groups.find(g => g.id === task.groupId) : null;
    return (
      <div
        className="text-xs px-1.5 py-0.5 rounded-md font-medium truncate cursor-pointer"
        style={{
          background: group ? `${group.color}20` : `${getPriorityColor(task.priority)}15`,
          color: group ? group.color : getPriorityColor(task.priority),
          textDecoration: task.completed ? 'line-through' : 'none',
          opacity: task.completed ? 0.6 : 1,
        }}
        onClick={() => setSelectedTask(task)}
      >
        {task.title}
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: 'calc(80px + 24px)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {format(currentDate, view === 'day' ? 'MMMM d' : 'MMMM yyyy')}
            </h1>
            {!isToday(currentDate) && (
              <button onClick={goToToday} className="text-sm font-medium mt-0.5" style={{ color: 'var(--accent-500)' }}>
                Back to today
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
              <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button onClick={() => navigate(1)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
          {(['month', 'week', 'day'] as CalendarView[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
              style={{
                background: view === v ? 'var(--bg-primary)' : 'transparent',
                color: view === v ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: view === v ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Month View */}
      {view === 'month' && (
        <div className="px-3">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-xs font-semibold py-2" style={{ color: 'var(--text-tertiary)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {monthDays.map(day => {
              const dayTasks = getTasksForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const hasOverdue = dayTasks.some(t => !t.completed);

              return (
                <motion.button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center py-1 px-0.5 rounded-2xl min-h-[52px] transition-all relative"
                  style={{
                    background: isSelected
                      ? 'var(--accent-500)'
                      : isToday(day)
                        ? 'var(--accent-100)'
                        : 'transparent',
                    opacity: isCurrentMonth ? 1 : 0.3,
                  }}
                >
                  <span
                    className="text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full"
                    style={{ color: isSelected ? 'white' : isToday(day) ? 'var(--accent-500)' : 'var(--text-primary)' }}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="flex gap-0.5 flex-wrap justify-center max-h-5 overflow-hidden">
                    {dayTasks.slice(0, 3).map(t => (
                      <div
                        key={t.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: isSelected ? 'white' : (groups.find(g => g.id === t.groupId)?.color ?? getPriorityColor(t.priority)),
                          opacity: t.completed ? 0.4 : 1,
                        }}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'white' : 'var(--text-tertiary)' }} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="px-3">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => {
              const dayTasks = getTasksForDate(day);
              const isSelected = isSameDay(day, selectedDate);

              return (
                <motion.button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center p-2 rounded-2xl transition-all"
                  style={{
                    background: isSelected ? 'var(--accent-500)' : isToday(day) ? 'var(--accent-100)' : 'var(--bg-secondary)',
                    minHeight: '70px',
                  }}
                >
                  <span className="text-xs font-semibold mb-1" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)' }}>
                    {format(day, 'EEE')}
                  </span>
                  <span className="text-base font-bold" style={{ color: isSelected ? 'white' : 'var(--text-primary)' }}>
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <div className="mt-1 flex gap-0.5">
                      {dayTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: isSelected ? 'white' : getPriorityColor(t.priority), opacity: t.completed ? 0.4 : 1 }} />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="px-5">
          {/* Day time slots - simplified */}
          <div className="space-y-1">
            {Array.from({ length: 16 }, (_, i) => i + 6).map(hour => {
              const hourTasks = selectedDateTasks.filter(t => t.dueTime && parseInt(t.dueTime.split(':')[0]) === hour);
              return (
                <div key={hour} className="flex gap-3 items-start">
                  <span className="text-xs w-10 pt-2 text-right flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    {hour === 12 ? '12pm' : hour < 12 ? `${hour}am` : `${hour - 12}pm`}
                  </span>
                  <div className="flex-1 min-h-[36px] border-t py-1" style={{ borderColor: 'var(--border-color)' }}>
                    {hourTasks.map(task => {
                      const group = task.groupId ? groups.find(g => g.id === task.groupId) : null;
                      return (
                        <button key={task.id} onClick={() => setSelectedTask(task)}
                          className="w-full text-left p-2 rounded-xl mb-1 text-xs font-medium"
                          style={{ background: group ? `${group.color}20` : `${getPriorityColor(task.priority)}15`, color: group ? group.color : getPriorityColor(task.priority) }}>
                          {task.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Tasks */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMM d')}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--accent-500)' }}
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <AnimatePresence>
          {selectedDateTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-10 rounded-2xl"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <span className="text-3xl mb-2">📅</span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No tasks this day</p>
              <button onClick={() => setShowAddTask(true)} className="text-sm font-medium mt-2" style={{ color: 'var(--accent-500)' }}>
                Add a task
              </button>
            </motion.div>
          ) : (
            <div>
              {incompleteTasks.map((task, i) => {
                const group = task.groupId ? groups.find(g => g.id === task.groupId) : null;
                return (
                  <motion.button
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedTask(task)}
                    className="w-full p-4 rounded-2xl text-left mb-2 flex items-center gap-3"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: group ? `${group.color}20` : `${getPriorityColor(task.priority)}15` }}>
                      <Flag className="w-4 h-4" style={{ color: group ? group.color : getPriorityColor(task.priority) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.dueTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatTime(task.dueTime)}</span>
                          </div>
                        )}
                        {group && <span className="text-xs font-medium" style={{ color: group.color }}>{group.name}</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                  </motion.button>
                );
              })}

              {completedTasks.length > 0 && (
                <>
                  <p className="text-xs font-semibold mb-2 mt-3" style={{ color: 'var(--text-tertiary)' }}>
                    COMPLETED · {completedTasks.length}
                  </p>
                  {completedTasks.map(task => (
                    <button key={task.id} onClick={() => setSelectedTask(task)}
                      className="w-full p-3 rounded-2xl text-left mb-2 flex items-center gap-2 opacity-50"
                      style={{ background: 'var(--bg-secondary)' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#22c55e' }}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm line-through" style={{ color: 'var(--text-secondary)' }}>{task.title}</p>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      <TaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        task={null}
      />
      {selectedTask && (
        <TaskDetailModal task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
