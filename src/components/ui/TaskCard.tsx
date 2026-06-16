import { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Check, Trash2, ChevronRight, Flag, Clock, Repeat } from 'lucide-react';
import type { Task } from '../../types';
import { useStore } from '../../store';
import { formatRelativeDate, formatTime, getPriorityColor, isOverdue } from '../../utils';

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
  showGroup?: boolean;
  compact?: boolean;
}

export default function TaskCard({ task, onPress, showGroup = true, compact = false }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const constraintsRef = useRef(null);
  const { completeTask, deleteTask, groups, getUserTasks } = useStore();

  const group = task.groupId ? groups.find(g => g.id === task.groupId) : null;
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const overdue = task.dueDate && !task.completed && isOverdue(task.dueDate);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x > 80) {
      completeTask(task.id);
    } else if (info.offset.x < -80) {
      deleteTask(task.id);
    }
    setSwipeX(0);
  };

  const priorityColor = getPriorityColor(task.priority);

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-2xl" style={{ marginBottom: compact ? '8px' : '10px' }}>
      {/* Swipe Backgrounds */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 flex items-center px-6 rounded-2xl" style={{ background: '#22c55e' }}>
          <Check className="w-5 h-5 text-white" />
          <span className="text-white text-sm font-semibold ml-2">Complete</span>
        </div>
        <div className="flex-1" />
      </div>
      <div className="absolute inset-0 flex">
        <div className="flex-1" />
        <div className="flex-1 flex items-center justify-end px-6 rounded-2xl" style={{ background: '#ef4444' }}>
          <span className="text-white text-sm font-semibold mr-2">Delete</span>
          <Trash2 className="w-5 h-5 text-white" />
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDrag={(_, info) => setSwipeX(info.offset.x)}
        onDragEnd={handleDragEnd}
        className="relative press-scale"
        style={{ x: swipeX * 0.1 }}
        onClick={() => !isDragging && onPress?.(task)}
        whileTap={isDragging ? {} : { scale: 0.98 }}
      >
        <div
          className="flex items-start gap-3 rounded-2xl"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: compact ? '12px 14px' : '14px 16px',
            opacity: task.completed ? 0.6 : 1,
          }}
        >
          {/* Checkbox */}
          <button
            onPointerDown={e => { e.stopPropagation(); completeTask(task.id); }}
            className="flex-shrink-0 mt-0.5 transition-all duration-200"
          >
            <div
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: task.completed ? '#22c55e' : priorityColor,
                background: task.completed ? '#22c55e' : 'transparent',
              }}
            >
              {task.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                className="text-sm font-medium leading-snug"
                style={{
                  color: 'var(--text-primary)',
                  textDecoration: task.completed ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </p>
              {onPress && (
                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-tertiary)' }} />
              )}
            </div>

            {task.description && !compact && (
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {task.description}
              </p>
            )}

            {/* Meta Row */}
            <div className="flex items-center flex-wrap gap-2 mt-2">
              {/* Priority */}
              <div className="flex items-center gap-1">
                <Flag className="w-3 h-3" style={{ color: priorityColor }} />
              </div>

              {/* Due date */}
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" style={{ color: overdue ? '#ef4444' : 'var(--text-tertiary)' }} />
                  <span
                    className="text-xs font-medium"
                    style={{ color: overdue ? '#ef4444' : 'var(--text-tertiary)' }}
                  >
                    {formatRelativeDate(task.dueDate)}
                    {task.dueTime && ` · ${formatTime(task.dueTime)}`}
                  </span>
                </div>
              )}

              {/* Recurring */}
              {task.recurring && (
                <Repeat className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
              )}

              {/* Group */}
              {showGroup && group && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: `${group.color}20` }}
                >
                  <span className="text-xs" style={{ fontSize: '10px' }}>{group.icon}</span>
                  <span className="text-xs font-medium" style={{ color: group.color, fontSize: '10px' }}>
                    {group.name}
                  </span>
                </div>
              )}

              {/* Subtasks */}
              {task.subtasks.length > 0 && (
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {completedSubtasks}/{task.subtasks.length} subtasks
                </span>
              )}
            </div>

            {/* Subtask progress bar */}
            {task.subtasks.length > 0 && (
              <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                    background: 'var(--accent-500)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
