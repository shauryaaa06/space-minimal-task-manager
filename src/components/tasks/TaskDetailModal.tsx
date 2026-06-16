import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Calendar, Clock, Repeat, Trash2, Edit3, Check, ChevronRight } from 'lucide-react';
import Modal from '../ui/Modal';
import TaskModal from './TaskModal';
import { useStore } from '../../store';
import { useToast } from '../ui/Toast';
import { formatRelativeDate, formatTime, getPriorityColor, getPriorityLabel, isOverdue } from '../../utils';
import type { Task } from '../../types';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: Task) => void;
}

export default function TaskDetailModal({ task, isOpen, onClose, onEdit: _ }: TaskDetailModalProps) {
  const [showEdit, setShowEdit] = useState(false);
  const { completeTask, deleteTask, toggleSubtask, groups } = useStore();
  const { showToast } = useToast();

  const group = task.groupId ? groups.find(g => g.id === task.groupId) : null;
  const overdue = task.dueDate && !task.completed && isOverdue(task.dueDate);
  const priorityColor = getPriorityColor(task.priority);

  const handleDelete = () => {
    deleteTask(task.id);
    showToast('Task deleted');
    onClose();
  };

  const handleComplete = () => {
    completeTask(task.id);
    showToast(task.completed ? 'Task uncompleted' : 'Task completed! 🎉');
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen && !showEdit} onClose={onClose} title={undefined}>
        <div className="px-6 pb-6">
          {/* Priority & Group Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: `${priorityColor}15` }}>
                <Flag className="w-3.5 h-3.5" style={{ color: priorityColor }} />
                <span className="text-xs font-semibold" style={{ color: priorityColor }}>
                  {getPriorityLabel(task.priority)}
                </span>
              </div>
              {group && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: `${group.color}15` }}>
                  <span>{group.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: group.color }}>{group.name}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <Edit3 className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
              <button
                onClick={handleDelete}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: '#fee2e2' }}
              >
                <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
              </button>
            </div>
          </div>

          {/* Title */}
          <h2
            className="text-xl font-bold mb-2 leading-snug"
            style={{
              color: 'var(--text-primary)',
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </h2>

          {/* Description */}
          {task.description && (
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {task.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="space-y-3 mb-5">
            {task.dueDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" style={{ color: overdue ? '#ef4444' : 'var(--text-tertiary)' }} />
                <span className="text-sm font-medium"
                  style={{ color: overdue ? '#ef4444' : 'var(--text-primary)' }}>
                  {formatRelativeDate(task.dueDate)}
                  {task.dueTime && ` at ${formatTime(task.dueTime)}`}
                  {overdue && ' (Overdue)'}
                </span>
              </div>
            )}
            {task.recurring && (
              <div className="flex items-center gap-3">
                <Repeat className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Repeats {task.recurring}
                </span>
              </div>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                SUBTASKS · {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
              </p>
              <div className="h-1 rounded-full mb-3 overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`,
                    background: 'var(--accent-500)',
                  }}
                />
              </div>
              <div className="space-y-2">
                {task.subtasks.map(sub => (
                  <motion.button
                    key={sub.id}
                    onClick={() => toggleSubtask(task.id, sub.id)}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 w-full p-3 rounded-xl transition-all"
                    style={{ background: sub.completed ? 'var(--bg-secondary)' : 'transparent' }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        borderColor: sub.completed ? 'var(--accent-500)' : 'var(--border-strong)',
                        background: sub.completed ? 'var(--accent-500)' : 'transparent',
                      }}
                    >
                      {sub.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <span
                      className="text-sm text-left"
                      style={{
                        color: sub.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        textDecoration: sub.completed ? 'line-through' : 'none',
                      }}
                    >
                      {sub.title}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="mb-5 p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>NOTES</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                {task.notes}
              </p>
            </div>
          )}

          {/* Complete Button */}
          <button
            onClick={handleComplete}
            className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: task.completed ? 'var(--bg-secondary)' : 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
              color: task.completed ? 'var(--text-secondary)' : 'white',
            }}
          >
            <Check className="w-5 h-5" />
            {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </button>
        </div>
      </Modal>

      <TaskModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        task={task}
      />
    </>
  );
}
