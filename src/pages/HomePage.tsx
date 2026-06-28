import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Bell, ChevronRight, Inbox, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { getGreeting, formatRelativeDate } from '../utils';
import TaskCard from '../components/ui/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import GroupCard from '../components/groups/GroupCard';
import type { Task } from '../types';

export default function HomePage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { user, getUserTasks, getUpcomingTasks, groups, notifications, getUnreadNotificationsCount, markAllNotificationsRead, setActiveTab, setActiveGroupId } = useStore();

  const openGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    setActiveTab('groups');
  };

  const allTasks = getUserTasks();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = useMemo(() =>
    allTasks.filter(t => t.dueDate === todayStr && !t.completed)
      .sort((a, b) => a.order - b.order),
    [allTasks, todayStr]
  );
  const overdueTasks = useMemo(() =>
    allTasks.filter(t => t.dueDate && t.dueDate < todayStr && !t.completed)
      .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!)),
    [allTasks, todayStr]
  );
  const inboxTasks = useMemo(() =>
    allTasks.filter(t => !t.dueDate && !t.completed)
      .sort((a, b) => a.order - b.order),
    [allTasks]
  );
  const completedToday = allTasks.filter(t => t.dueDate === todayStr && t.completed).length;
  const upcomingTasks = getUpcomingTasks(7).filter(t => t.dueDate !== todayStr).slice(0, 5);
  const activeGroups = groups.filter(g => !g.archived).sort((a, b) => a.order - b.order);
  const unreadCount = getUnreadNotificationsCount();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allTasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.notes?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [searchQuery, allTasks]);

  const totalTasksToday = todayTasks.length + completedToday;
  const progressPercent = totalTasksToday > 0 ? Math.round((completedToday / totalTasksToday) * 100) : 0;

  return (
    <div className="pb-6" style={{ paddingBottom: 'calc(80px + 24px)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-2xl font-bold mt-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {getGreeting(user?.name)}
            </motion.h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <Search className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button
              onClick={() => { setShowNotifications(!showNotifications); markAllNotificationsRead(); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center relative"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <Bell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'var(--accent-500)', fontSize: '10px' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <input
                type="search"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input"
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        <AnimatePresence>
          {showSearch && searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2"
            >
              {searchResults.length > 0 ? (
                searchResults.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={t => { setSelectedTask(t); setShowSearch(false); setSearchQuery(''); }}
                  />
                ))
              ) : (
                <div className="text-center py-6" style={{ color: 'var(--text-tertiary)' }}>
                  <p className="text-sm">No tasks found for "{searchQuery}"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded-2xl overflow-hidden border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</p>
              </div>
              {notifications.slice(0, 5).length > 0 ? (
                notifications.slice(0, 5).map(n => (
                  <div key={n.id} className="px-4 py-3 border-b last:border-0"
                    style={{ borderColor: 'var(--border-color)', background: n.read ? 'transparent' : 'var(--accent-50)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No notifications</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Today's Progress Card */}
      {totalTasksToday > 0 && !showSearch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-5 mb-5 p-4 rounded-2xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))' }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white opacity-10" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white opacity-10" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm">Today's Progress</p>
                <p className="text-white font-bold text-xl">{completedToday} / {totalTasksToday} done</p>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 progress-ring" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                  <circle
                    cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercent / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{progressPercent}%</span>
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}

      {!showSearch && (
        <>
          {/* Groups Section */}
          {activeGroups.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between px-5 mb-3">
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Groups</h2>
                <button
                  onClick={() => setActiveTab('groups')}
                  className="text-sm font-medium"
                  style={{ color: 'var(--accent-500)' }}
                >
                  See all
                </button>
              </div>
              <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar pb-1">
                {activeGroups.slice(0, 8).map((group, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GroupCard group={group} compact onPress={g => openGroup(g.id)} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="px-5 mb-6">
              <h2 className="text-base font-bold mb-3" style={{ color: '#ef4444' }}>
                Overdue
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#fee2e2', color: '#ef4444' }}>
                  {overdueTasks.length}
                </span>
              </h2>
              <AnimatePresence>
                {overdueTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <TaskCard task={task} onPress={setSelectedTask} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Today's Tasks */}
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Today {todayTasks.length > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: 'var(--accent-100)', color: 'var(--accent-600)' }}>
                    {todayTasks.length}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
                style={{ background: 'var(--accent-500)', color: 'white' }}
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            {todayTasks.length > 0 ? (
              <AnimatePresence>
                {todayTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <TaskCard task={task} onPress={setSelectedTask} />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-10 rounded-2xl"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <Sparkles className="w-8 h-8 mb-3" style={{ color: 'var(--accent-400)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>All clear for today!</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Tap + to add a task</p>
              </motion.div>
            )}
          </div>

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <div className="px-5 mb-6">
              <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Upcoming</h2>
              {upcomingTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <TaskCard task={task} onPress={setSelectedTask} compact />
                </motion.div>
              ))}
            </div>
          )}

          {/* Inbox — tasks with no due date */}
          {inboxTasks.length > 0 && (
            <div className="px-5">
              <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Inbox
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                  {inboxTasks.length}
                </span>
              </h2>
              <AnimatePresence>
                {inboxTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <TaskCard task={task} onPress={setSelectedTask} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* All tasks empty state */}
          {allTasks.filter(t => !t.completed).length === 0 && (
            <div className="px-5 flex flex-col items-center py-16">
              <Inbox className="w-16 h-16 mb-4" style={{ color: 'var(--text-tertiary)', opacity: 0.4 }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Your space is clear</h3>
              <p className="text-sm text-center mb-6" style={{ color: 'var(--text-tertiary)' }}>
                Add your first task to get started on your productivity journey.
              </p>
              <button onClick={() => setShowAddTask(true)} className="btn-primary">
                Create Your First Task
              </button>
            </div>
          )}
        </>
      )}

      {/* FAB */}
      {!showSearch && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
          onClick={() => setShowAddTask(true)}
          className="fixed right-5 shadow-xl flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{
            bottom: 'calc(80px + 20px)',
            background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
            boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
          }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
        >
          <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
        </motion.button>
      )}

      <TaskModal isOpen={showAddTask} onClose={() => setShowAddTask(false)} />
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={t => { setSelectedTask(null); setTimeout(() => setSelectedTask(t), 50); }}
        />
      )}
    </div>
  );
}
