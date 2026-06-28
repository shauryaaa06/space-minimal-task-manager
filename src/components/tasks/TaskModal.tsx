import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag, Calendar, Clock, Bell, Repeat, Tag, FileText,
  Plus, Trash2, Check, ChevronDown, X, AlignLeft
} from 'lucide-react';
import Modal from '../ui/Modal';
import { useStore } from '../../store';
import { useToast } from '../ui/Toast';
import type { Task, Priority, RecurringType } from '../../types';
import { getPriorityColor, getPriorityLabel } from '../../utils';
import { format, parseISO } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultGroupId?: string;
}

const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];
const RECURRING_OPTIONS: { value: RecurringType; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function TaskModal({ isOpen, onClose, task, defaultGroupId }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [groupId, setGroupId] = useState(defaultGroupId ?? '');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState<RecurringType | ''>('');
  const [subtasks, setSubtasks] = useState<Array<{ id: string; title: string; completed: boolean }>>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [showRecurringPicker, setShowRecurringPicker] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const { addTask, updateTask, groups, user } = useStore();
  const { showToast } = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority);
      setDueDate(task.dueDate ?? '');
      setDueTime(task.dueTime ?? '');
      setGroupId(task.groupId ?? '');
      setNotes(task.notes ?? '');
      setRecurring(task.recurring ?? '');
      setSubtasks(task.subtasks.map(s => ({ id: s.id, title: s.title, completed: s.completed })));
    } else {
      setTitle('');
      setDescription('');
      setPriority(user?.settings.defaultPriority ?? 'medium');
      setDueDate('');
      setDueTime('');
      setGroupId(defaultGroupId ?? '');
      setNotes('');
      setRecurring('');
      setSubtasks([]);
      setNewSubtask('');
      setShowAdvanced(false);
    }
  }, [task, isOpen, defaultGroupId, user]);

  const handleSave = () => {
    if (!title.trim()) { showToast('Please enter a task title', 'error'); return; }

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      groupId: groupId || undefined,
      notes: notes.trim() || undefined,
      recurring: (recurring || undefined) as RecurringType | undefined,
      subtasks: subtasks.map(s => ({ ...s, createdAt: new Date().toISOString() })),
      tags: [],
    };

    if (task) {
      updateTask(task.id, taskData);
      showToast('Task updated');
    } else {
      addTask({ ...taskData, completed: false });
      showToast('Task created');
    }
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks(prev => [...prev, { id: Math.random().toString(36).slice(2), title: newSubtask.trim(), completed: false }]);
    setNewSubtask('');
  };

  const removeSubtask = (id: string) => setSubtasks(prev => prev.filter(s => s.id !== id));
  const toggleSubtask = (id: string) => setSubtasks(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));

  const selectedGroup = groups.find(g => g.id === groupId);
  const userGroups = groups.filter(g => !g.archived);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'New Task'} fullHeight>
      <div className="px-6 pb-6 space-y-4">
        {/* Title */}
        <textarea
          placeholder="What do you need to do?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="input resize-none text-base font-medium"
          style={{ minHeight: '60px', padding: '14px 16px' }}
          autoFocus
          rows={2}
        />

        {/* Description */}
        <div className="relative">
          <AlignLeft className="absolute left-4 top-3.5 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <textarea
            placeholder="Add description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="input resize-none pl-11"
            rows={2}
            style={{ minHeight: '50px' }}
          />
        </div>

        {/* Quick Options Row */}
        <div className="flex flex-wrap gap-2">
          {/* Priority */}
          <button
            onClick={() => setShowPriorityPicker(!showPriorityPicker)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
          >
            <Flag className="w-3.5 h-3.5" style={{ color: getPriorityColor(priority) }} />
            <span style={{ color: getPriorityColor(priority) }}>{getPriorityLabel(priority)}</span>
          </button>

          {/* Group */}
          <button
            onClick={() => setShowGroupPicker(!showGroupPicker)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
          >
            {selectedGroup ? (
              <>
                <span>{selectedGroup.icon}</span>
                <span style={{ color: selectedGroup.color }}>{selectedGroup.name}</span>
              </>
            ) : (
              <>
                <Tag className="w-3.5 h-3.5" />
                <span>Group</span>
              </>
            )}
          </button>

          {/* Due Date — a transparent native date input is overlaid on top of the
              chip so tapping it opens the OS date picker directly. This works in
              iOS WKWebView, where the showPicker() API is unavailable. */}
          <div className="relative inline-flex">
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: dueDate ? 'var(--accent-100)' : 'var(--bg-secondary)', color: dueDate ? 'var(--accent-600)' : 'var(--text-secondary)', border: `1px solid ${dueDate ? 'var(--accent-300)' : 'var(--border-color)'}` }}
            >
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{dueDate ? format(parseISO(dueDate), 'MMM d') : 'Due date'}</span>
              {dueDate && <span className="w-3 ml-1" />}
            </div>
            <input
              ref={dateInputRef}
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              aria-label="Due date"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ WebkitAppearance: 'none' }}
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate('')}
                aria-label="Clear due date"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
              >
                <X className="w-3 h-3" style={{ color: 'var(--accent-600)' }} />
              </button>
            )}
          </div>
        </div>

        {/* Priority Picker */}
        <AnimatePresence>
          {showPriorityPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl overflow-hidden border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  onClick={() => { setPriority(p); setShowPriorityPicker(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-opacity-50 transition-all"
                  style={{ background: priority === p ? `${getPriorityColor(p)}15` : 'transparent' }}
                >
                  <Flag className="w-4 h-4" style={{ color: getPriorityColor(p) }} />
                  <span className="text-sm font-medium" style={{ color: getPriorityColor(p) }}>
                    {getPriorityLabel(p)}
                  </span>
                  {priority === p && <Check className="w-4 h-4 ml-auto" style={{ color: getPriorityColor(p) }} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Group Picker */}
        <AnimatePresence>
          {showGroupPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl overflow-hidden border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={() => { setGroupId(''); setShowGroupPicker(false); }}
                className="w-full flex items-center gap-3 px-4 py-3"
              >
                <Tag className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No Group</span>
                {!groupId && <Check className="w-4 h-4 ml-auto" style={{ color: 'var(--accent-500)' }} />}
              </button>
              {userGroups.map(g => (
                <button
                  key={g.id}
                  onClick={() => { setGroupId(g.id); setShowGroupPicker(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3"
                  style={{ background: groupId === g.id ? `${g.color}15` : 'transparent' }}
                >
                  <span>{g.icon}</span>
                  <span className="text-sm font-medium" style={{ color: g.color }}>{g.name}</span>
                  {groupId === g.id && <Check className="w-4 h-4 ml-auto" style={{ color: g.color }} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm py-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <ChevronDown
            className="w-4 h-4 transition-transform"
            style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0)' }}
          />
          {showAdvanced ? 'Less options' : 'More options'}
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Time */}
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>DUE TIME</p>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={e => setDueTime(e.target.value)}
                    className="input text-sm"
                    style={{ padding: '10px 14px' }}
                  />
                </div>
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-3">
                <Repeat className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>REPEAT</p>
                  <div className="flex flex-wrap gap-2">
                    {RECURRING_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setRecurring(recurring === opt.value ? '' : opt.value)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: recurring === opt.value ? 'var(--accent-500)' : 'var(--bg-secondary)',
                          color: recurring === opt.value ? 'white' : 'var(--text-secondary)',
                          border: `1px solid ${recurring === opt.value ? 'var(--accent-500)' : 'var(--border-color)'}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>SUBTASKS</p>
                </div>
                <div className="space-y-2">
                  {subtasks.map(s => (
                    <div key={s.id} className="flex items-center gap-2">
                      <button onClick={() => toggleSubtask(s.id)}>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: s.completed ? 'var(--accent-500)' : 'var(--border-strong)', background: s.completed ? 'var(--accent-500)' : 'transparent' }}>
                          {s.completed && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                      <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)', textDecoration: s.completed ? 'line-through' : 'none' }}>
                        {s.title}
                      </span>
                      <button onClick={() => removeSubtask(s.id)}>
                        <X className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add subtask..."
                      value={newSubtask}
                      onChange={e => setNewSubtask(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSubtask()}
                      className="input text-sm flex-1"
                      style={{ padding: '8px 12px' }}
                    />
                    <button
                      onClick={addSubtask}
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--accent-500)' }}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>NOTES</p>
                </div>
                <textarea
                  placeholder="Add notes..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input resize-none text-sm"
                  rows={3}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="btn-primary w-full"
          style={{ marginTop: '8px', padding: '14px' }}
        >
          {task ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </Modal>
  );
}
