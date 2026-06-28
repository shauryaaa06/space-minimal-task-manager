import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Link, Lock, Archive, Trash2, Share2, ChevronRight, MoreHorizontal, X } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/ui/Toast';
import TaskCard from '../components/ui/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import Modal from '../components/ui/Modal';
import type { Group, Task } from '../types';
import { GROUP_COLORS, GROUP_ICONS } from '../utils';
import { COLLABORATION_ENABLED } from '../config';

function GroupListItem({ group, index, onClick }: { group: Group; index: number; onClick: () => void }) {
  const tasks = useStore(s => s.tasks);
  const { total, completed, percentage } = useMemo(() => {
    const groupTasks = tasks.filter(t => t.groupId === group.id && !t.deletedAt);
    const completedCount = groupTasks.filter(t => t.completed).length;
    const total = groupTasks.length;
    return { total, completed: completedCount, percentage: total === 0 ? 0 : Math.round((completedCount / total) * 100) };
  }, [tasks, group.id]);
  return (
    <motion.button
      key={group.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full p-4 rounded-2xl text-left mb-3 flex items-center gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `${group.color}20` }}>
        {group.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{group.name}</p>
            {COLLABORATION_ENABLED && group.isShared && (
              <Share2 className="w-3.5 h-3.5" style={{ color: group.color }} />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: group.color }}>{percentage}%</span>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          </div>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {completed}/{total} tasks · {COLLABORATION_ENABLED && group.isShared ? `${group.members?.length ?? 1} members` : 'Private'}
        </p>
        {total > 0 && (
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: group.color, transition: 'width 0.5s' }} />
          </div>
        )}
      </div>
    </motion.button>
  );
}

export default function GroupsPage() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'chat' | 'members' | 'activity'>('tasks');
  const [showGroupActions, setShowGroupActions] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // Create group form
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState(GROUP_COLORS[0]);
  const [groupIcon, setGroupIcon] = useState('📚');
  const [isShared, setIsShared] = useState(false);
  const [groupDesc, setGroupDesc] = useState('');

  const { groups, addGroup, deleteGroup, archiveGroup, joinGroup, sendChatMessage, chatMessages, getTasksByGroup, activityFeed, activeGroupId, setActiveGroupId } = useStore();
  const { showToast } = useToast();

  // When a group is opened from another page (e.g. Home), show its detail view.
  useEffect(() => {
    if (activeGroupId) {
      const group = groups.find(g => g.id === activeGroupId);
      if (group) setSelectedGroup(group);
      setActiveGroupId(null);
    }
  }, [activeGroupId, groups, setActiveGroupId]);

  const activeGroups = groups.filter(g => !g.archived);
  const archivedGroups = groups.filter(g => g.archived);

  const handleCreateGroup = () => {
    if (!groupName.trim()) { showToast('Please enter a group name', 'error'); return; }
    const group = addGroup({ name: groupName.trim(), color: groupColor, icon: groupIcon, isShared, description: groupDesc.trim() || undefined, archived: false });
    showToast(`${groupName} created`);
    setShowCreateGroup(false);
    setGroupName(''); setGroupDesc(''); setIsShared(false);
    setSelectedGroup(group);
  };

  const handleJoinGroup = () => {
    if (!joinCode.trim()) { showToast('Please enter a code', 'error'); return; }
    const group = joinGroup(joinCode.trim().toUpperCase());
    if (group) { showToast(`Joined ${group.name}`); setShowJoinGroup(false); setJoinCode(''); setSelectedGroup(group); }
    else showToast('Invalid invite code', 'error');
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedGroup) return;
    sendChatMessage(selectedGroup.id, chatMessage.trim());
    setChatMessage('');
  };

  const groupTasks = selectedGroup ? getTasksByGroup(selectedGroup.id) : [];
  const incompleteTasks = groupTasks.filter(t => !t.completed);
  const completedTasks = groupTasks.filter(t => t.completed);
  const groupMessages = selectedGroup ? chatMessages.filter(m => m.groupId === selectedGroup.id) : [];
  const groupActivity = selectedGroup ? activityFeed.filter(a => a.groupId === selectedGroup.id) : [];

  if (selectedGroup) {
    return (
      <div className="h-full flex flex-col" style={{ paddingBottom: 'calc(80px + 0px)' }}>
        {/* Group Header */}
        <div
          className="px-5 pt-12 pb-4"
          style={{ background: `${selectedGroup.color}10` }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedGroup(null)}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button
              onClick={() => setShowGroupActions(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `${selectedGroup.color}20` }}
            >
              {selectedGroup.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedGroup.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {COLLABORATION_ENABLED && selectedGroup.isShared ? (
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" style={{ color: selectedGroup.color }} />
                    <span className="text-xs font-medium" style={{ color: selectedGroup.color }}>
                      {selectedGroup.members?.length ?? 1} members
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Private</span>
                  </div>
                )}
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{groupTasks.length} tasks</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {selectedGroup.description && (
            <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>{selectedGroup.description}</p>
          )}

          {/* Invite Code */}
          {COLLABORATION_ENABLED && selectedGroup.isShared && selectedGroup.inviteCode && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <Link className="w-4 h-4" style={{ color: selectedGroup.color }} />
              <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                {selectedGroup.inviteCode}
              </span>
              <button
                className="ml-auto text-xs font-semibold px-3 py-1 rounded-lg"
                style={{ background: `${selectedGroup.color}20`, color: selectedGroup.color }}
                onClick={() => { navigator.clipboard?.writeText(selectedGroup.inviteCode!); showToast('Code copied!'); }}
              >
                Copy
              </button>
            </div>
          )}
        </div>

        {/* Tabs — only shown for shared groups (chat / members / activity) */}
        {COLLABORATION_ENABLED && selectedGroup.isShared && (
          <div className="flex px-5 pt-3 gap-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
            {(['tasks', 'chat', 'members', 'activity'] as typeof activeTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 text-sm font-medium rounded-t-xl capitalize transition-all"
                style={{
                  color: activeTab === tab ? selectedGroup.color : 'var(--text-tertiary)',
                  borderBottom: activeTab === tab ? `2px solid ${selectedGroup.color}` : '2px solid transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'tasks' && (
            <div className="px-5 py-4">
              <button
                onClick={() => setShowAddTask(true)}
                className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 mb-4"
                style={{ background: `${selectedGroup.color}15`, color: selectedGroup.color, border: `1.5px dashed ${selectedGroup.color}40` }}
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>

              {incompleteTasks.length === 0 && completedTasks.length === 0 && (
                <div className="flex flex-col items-center py-12">
                  <div className="text-4xl mb-3">{selectedGroup.icon}</div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No tasks yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Add tasks to get started</p>
                </div>
              )}

              <AnimatePresence>
                {incompleteTasks.map((task, i) => (
                  <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <TaskCard task={task} onPress={setSelectedTask} showGroup={false} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {completedTasks.length > 0 && (
                <>
                  <p className="text-xs font-semibold mb-3 mt-4" style={{ color: 'var(--text-tertiary)' }}>
                    COMPLETED · {completedTasks.length}
                  </p>
                  {completedTasks.map(task => (
                    <TaskCard key={task.id} task={task} onPress={setSelectedTask} showGroup={false} />
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
                {groupMessages.length === 0 ? (
                  <div className="flex flex-col items-center py-12">
                    <span className="text-4xl mb-3">💬</span>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  groupMessages.map(msg => (
                    <div key={msg.id} className="flex flex-col">
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>{msg.userName}</p>
                      <div className="p-3 rounded-2xl max-w-xs self-start"
                        style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-5 pb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Message..."
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  className="input flex-1"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: selectedGroup.color }}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="px-5 py-4">
              {(selectedGroup.members ?? []).map(member => (
                <div key={member.userId} className="flex items-center gap-3 p-4 rounded-2xl mb-2"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: selectedGroup.color }}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="px-5 py-4">
              {groupActivity.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <span className="text-4xl mb-3">📋</span>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No activity yet</p>
                </div>
              ) : (
                groupActivity.map(item => (
                  <div key={item.id} className="flex gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: selectedGroup.color }} />
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        <strong>{item.userName}</strong> {item.action} <strong>{item.targetTitle}</strong>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Group Actions Modal */}
        <Modal isOpen={showGroupActions} onClose={() => setShowGroupActions(false)} title="Group Options">
          <div className="px-6 pb-6 space-y-2">
            <button
              onClick={() => { archiveGroup(selectedGroup.id); setShowGroupActions(false); setSelectedGroup(null); showToast('Group archived'); }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <Archive className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Archive Group</span>
            </button>
            <button
              onClick={() => { deleteGroup(selectedGroup.id); setShowGroupActions(false); setSelectedGroup(null); showToast('Group deleted'); }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
              style={{ background: '#fee2e2' }}
            >
              <Trash2 className="w-5 h-5" style={{ color: '#ef4444' }} />
              <span className="text-sm font-medium" style={{ color: '#ef4444' }}>Delete Group</span>
            </button>
          </div>
        </Modal>

        {selectedTask && (
          <TaskDetailModal task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} />
        )}
        <TaskModal isOpen={showAddTask} onClose={() => setShowAddTask(false)} defaultGroupId={selectedGroup.id} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 'calc(80px + 24px)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Groups</h1>
          <div className="flex gap-2">
            {COLLABORATION_ENABLED && (
              <button
                onClick={() => setShowJoinGroup(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
              >
                <Link className="w-4 h-4" /> Join
              </button>
            )}
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: 'var(--accent-500)' }}
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
        </div>
      </div>

      <div className="px-5">
        {activeGroups.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <Users className="w-16 h-16 mb-4" style={{ color: 'var(--text-tertiary)', opacity: 0.3 }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>No groups yet</h3>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--text-tertiary)' }}>
              Create groups to organize tasks by class, project, or team.
            </p>
            <button onClick={() => setShowCreateGroup(true)} className="btn-primary">Create First Group</button>
          </div>
        ) : (
          <>
            <div className="mb-2">
              <AnimatePresence>
                {activeGroups.sort((a, b) => a.order - b.order).map((group, i) => (
                  <GroupListItem key={group.id} group={group} index={i} onClick={() => setSelectedGroup(group)} />
                ))}
              </AnimatePresence>
            </div>

            {archivedGroups.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-tertiary)' }}>ARCHIVED</p>
                {archivedGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className="w-full p-4 rounded-2xl text-left mb-2 flex items-center gap-3 opacity-50"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: 'var(--bg-tertiary)' }}>
                      {group.icon}
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{group.name}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Group Modal */}
      <Modal isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} title="New Group" fullHeight>
        <div className="px-6 pb-6 space-y-4">
          <input
            type="text"
            placeholder="Group name"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            className="input"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={groupDesc}
            onChange={e => setGroupDesc(e.target.value)}
            className="input resize-none"
            rows={2}
          />

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>ICON</p>
            <div className="grid grid-cols-8 gap-2">
              {GROUP_ICONS.map(icon => (
                <button key={icon} onClick={() => setGroupIcon(icon)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{ background: groupIcon === icon ? 'var(--accent-100)' : 'var(--bg-secondary)', border: groupIcon === icon ? '2px solid var(--accent-500)' : '2px solid transparent' }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>COLOR</p>
            <div className="flex flex-wrap gap-2">
              {GROUP_COLORS.map(color => (
                <button key={color} onClick={() => setGroupColor(color)}
                  className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                  style={{ background: color, transform: groupColor === color ? 'scale(1.2)' : 'scale(1)', boxShadow: groupColor === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : 'none' }}>
                </button>
              ))}
            </div>
          </div>

          {COLLABORATION_ENABLED && (
            <div className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: 'var(--bg-secondary)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Collaborative Group</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Invite others to join</p>
              </div>
              <button onClick={() => setIsShared(!isShared)}
                className="relative w-12 h-7 rounded-full transition-all"
                style={{ background: isShared ? 'var(--accent-500)' : 'var(--bg-tertiary)' }}>
                <div className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all"
                  style={{ left: isShared ? '22px' : '2px' }} />
              </button>
            </div>
          )}

          {/* Preview */}
          <div className="p-4 rounded-2xl flex items-center gap-3"
            style={{ background: `${groupColor}10`, border: `2px solid ${groupColor}30` }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `${groupColor}20` }}>
              {groupIcon}
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{groupName || 'Group Name'}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{isShared ? 'Shared Group' : 'Private Group'}</p>
            </div>
          </div>

          <button onClick={handleCreateGroup} className="btn-primary w-full" style={{ padding: '14px' }}>
            Create Group
          </button>
        </div>
      </Modal>

      {/* Join Group Modal */}
      {COLLABORATION_ENABLED && (
        <Modal isOpen={showJoinGroup} onClose={() => setShowJoinGroup(false)} title="Join Group">
          <div className="px-6 pb-6 space-y-4">
            <input
              type="text"
              placeholder="Enter invite code (e.g. AB12CD)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              className="input font-mono text-center text-lg tracking-widest"
              maxLength={6}
              autoFocus
            />
            <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
              Ask a group admin for the 6-character invite code
            </p>
            <button onClick={handleJoinGroup} className="btn-primary w-full" style={{ padding: '14px' }}>
              Join Group
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
