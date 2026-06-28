import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  User, Task, Group, CalendarEvent, FocusSession,
  Notification, ChatMessage, ActivityItem, UserSettings,
  Priority, GroupRole, ColorScheme, ThemePreset
} from '../types';

const defaultSettings: UserSettings = {
  theme: 'ocean',
  colorScheme: 'light',
  notifications: true,
  defaultView: 'list',
  weekStartsOn: 0,
  showCompletedTasks: true,
  autoDeleteCompletedDays: 0,
  autoEmptyTrashDays: 0,
  defaultPriority: 'medium',
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  hapticFeedback: true,
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
};

export type AppTab = 'home' | 'calendar' | 'groups' | 'focus' | 'settings';

interface AppStore {
  // Auth
  user: User | null;
  isGuest: boolean;
  onboardingComplete: boolean;

  // Data
  tasks: Task[];
  groups: Group[];
  calendarEvents: CalendarEvent[];
  focusSessions: FocusSession[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  activityFeed: ActivityItem[];
  deletedTasks: Task[];

  // UI State
  activeTab: AppTab;
  activeGroupId: string | null;
  selectedDate: string | null;

  // Auth Actions
  register: (name: string, email: string, password: string) => User;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  continueAsGuest: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  completeOnboarding: () => void;
  deleteAccount: () => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'subtasks' | 'tags' | 'order'> & { subtasks?: Task['subtasks'], tags?: string[] }) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  permanentlyDeleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  runAutoCleanup: () => void;
  reorderTasks: (taskIds: string[]) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Group Actions
  addGroup: (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'order'>) => Group;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  archiveGroup: (id: string) => void;
  reorderGroups: (groupIds: string[]) => void;
  joinGroup: (inviteCode: string) => Group | null;
  addGroupMember: (groupId: string, userId: string, name: string, email: string, role?: GroupRole) => void;
  sendChatMessage: (groupId: string, content: string) => void;

  // Calendar Actions
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'userId'>) => CalendarEvent;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Focus Actions
  addFocusSession: (session: Omit<FocusSession, 'id' | 'userId'>) => void;

  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // UI Actions
  setActiveTab: (tab: AppTab) => void;
  setActiveGroupId: (id: string | null) => void;
  setSelectedDate: (date: string | null) => void;

  // Export/Import
  exportData: () => string;
  importData: (json: string) => boolean;

  // Getters
  getTasksByGroup: (groupId: string) => Task[];
  getTasksForDate: (date: string) => Task[];
  getUpcomingTasks: (days?: number) => Task[];
  getGroupProgress: (groupId: string) => { total: number; completed: number; percentage: number };
  getUserTasks: () => Task[];
  getUnreadNotificationsCount: () => number;
}

const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hashed_${Math.abs(hash)}_${password.length}`;
};

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: false,
      onboardingComplete: false,
      tasks: [],
      groups: [],
      calendarEvents: [],
      focusSessions: [],
      notifications: [],
      chatMessages: [],
      activityFeed: [],
      deletedTasks: [],
      activeTab: 'home',
      activeGroupId: null,
      selectedDate: null,

      register: (name, email, password) => {
        const user: User = {
          id: uuidv4(),
          name,
          email,
          passwordHash: hashPassword(password),
          userType: 'student',
          createdAt: new Date().toISOString(),
          settings: { ...defaultSettings },
        };
        set({ user, isGuest: false });
        return user;
      },

      login: (email, password) => {
        const stored = localStorage.getItem('space-users');
        if (!stored) return null;
        const users: User[] = JSON.parse(stored);
        const user = users.find(u => u.email === email && u.passwordHash === hashPassword(password));
        if (user) {
          set({ user, isGuest: false, onboardingComplete: true });
          return user;
        }
        return null;
      },

      logout: () => {
        set({
          user: null, isGuest: false, onboardingComplete: false,
          tasks: [], groups: [], calendarEvents: [], notifications: [],
          focusSessions: [], chatMessages: [], activityFeed: [], deletedTasks: [],
          activeGroupId: null,
        });
      },

      continueAsGuest: () => {
        const guestUser: User = {
          id: 'guest',
          name: 'Guest',
          email: '',
          passwordHash: '',
          userType: 'personal',
          createdAt: new Date().toISOString(),
          settings: { ...defaultSettings },
        };
        set({ user: guestUser, isGuest: true, onboardingComplete: true });
      },

      updateUser: (updates) => {
        const { user } = get();
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        set({ user: updatedUser });
        const stored = localStorage.getItem('space-users');
        const users: User[] = stored ? JSON.parse(stored) : [];
        const idx = users.findIndex(u => u.id === user.id);
        if (idx >= 0) users[idx] = updatedUser;
        else users.push(updatedUser);
        localStorage.setItem('space-users', JSON.stringify(users));
      },

      updateSettings: (settings) => {
        const { user } = get();
        if (!user) return;
        const updatedUser = { ...user, settings: { ...user.settings, ...settings } };
        set({ user: updatedUser });
        const stored = localStorage.getItem('space-users');
        const users: User[] = stored ? JSON.parse(stored) : [];
        const idx = users.findIndex(u => u.id === user.id);
        if (idx >= 0) users[idx] = updatedUser;
        localStorage.setItem('space-users', JSON.stringify(users));
      },

      completeOnboarding: () => {
        const { user } = get();
        if (user && !get().isGuest) {
          const stored = localStorage.getItem('space-users');
          const users: User[] = stored ? JSON.parse(stored) : [];
          const idx = users.findIndex(u => u.id === user.id);
          if (idx >= 0) users[idx] = user;
          else users.push(user);
          localStorage.setItem('space-users', JSON.stringify(users));
        }
        set({ onboardingComplete: true });
      },

      deleteAccount: () => {
        const { user } = get();
        if (user) {
          const stored = localStorage.getItem('space-users');
          const users: User[] = stored ? JSON.parse(stored) : [];
          localStorage.setItem('space-users', JSON.stringify(users.filter(u => u.id !== user.id)));
        }
        get().logout();
      },

      addTask: (taskData) => {
        const { user, tasks } = get();
        const task: Task = {
          id: uuidv4(),
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority ?? 'medium',
          completed: false,
          dueDate: taskData.dueDate,
          dueTime: taskData.dueTime,
          reminder: taskData.reminder,
          groupId: taskData.groupId,
          userId: user?.id ?? 'guest',
          subtasks: taskData.subtasks ?? [],
          notes: taskData.notes,
          recurring: taskData.recurring,
          tags: taskData.tags ?? [],
          order: tasks.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ tasks: [...tasks, task] });
        return task;
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          )
        }));
      },

      deleteTask: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id),
          deletedTasks: [...state.deletedTasks, { ...task, deletedAt: new Date().toISOString() }],
        }));
      },

      restoreTask: (id) => {
        const task = get().deletedTasks.find(t => t.id === id);
        if (!task) return;
        const { deletedAt: _, ...restoredTask } = task;
        set(state => ({
          deletedTasks: state.deletedTasks.filter(t => t.id !== id),
          tasks: [...state.tasks, restoredTask],
        }));
      },

      permanentlyDeleteTask: (id) => {
        set(state => ({ deletedTasks: state.deletedTasks.filter(t => t.id !== id) }));
      },

      completeTask: (id) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id
              ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() }
              : t
          )
        }));
      },

      runAutoCleanup: () => {
        const { user } = get();
        const completedDays = user?.settings.autoDeleteCompletedDays ?? 0;
        const trashDays = user?.settings.autoEmptyTrashDays ?? 0;
        if (!completedDays && !trashDays) return;

        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;

        set(state => {
          let tasks = state.tasks;
          let deletedTasks = state.deletedTasks;

          // Move long-completed tasks into the trash
          if (completedDays > 0) {
            const cutoff = now - completedDays * dayMs;
            const expired = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).getTime() < cutoff);
            if (expired.length) {
              const ids = new Set(expired.map(t => t.id));
              tasks = tasks.filter(t => !ids.has(t.id));
              deletedTasks = [...deletedTasks, ...expired.map(t => ({ ...t, deletedAt: new Date().toISOString() }))];
            }
          }

          // Permanently empty old items from the trash
          if (trashDays > 0) {
            const cutoff = now - trashDays * dayMs;
            deletedTasks = deletedTasks.filter(t => !(t.deletedAt && new Date(t.deletedAt).getTime() < cutoff));
          }

          return { tasks, deletedTasks };
        });
      },

      reorderTasks: (taskIds) => {
        set(state => ({
          tasks: state.tasks.map(t => ({ ...t, order: taskIds.indexOf(t.id) }))
        }));
      },

      addSubtask: (taskId, title) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: [...t.subtasks, { id: uuidv4(), title, completed: false, createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() }
              : t
          )
        }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s), updatedAt: new Date().toISOString() }
              : t
          )
        }));
      },

      deleteSubtask: (taskId, subtaskId) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId), updatedAt: new Date().toISOString() }
              : t
          )
        }));
      },

      addGroup: (groupData) => {
        const { user, groups } = get();
        const group: Group = {
          id: uuidv4(),
          name: groupData.name,
          color: groupData.color,
          icon: groupData.icon,
          userId: user?.id ?? 'guest',
          isShared: groupData.isShared ?? false,
          inviteCode: groupData.isShared ? Math.random().toString(36).substring(2, 8).toUpperCase() : undefined,
          description: groupData.description,
          archived: false,
          order: groups.length,
          members: groupData.isShared ? [{ userId: user?.id ?? 'guest', name: user?.name ?? 'Guest', email: user?.email ?? '', role: 'owner', joinedAt: new Date().toISOString() }] : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ groups: [...groups, group] });
        return group;
      },

      updateGroup: (id, updates) => {
        set(state => ({
          groups: state.groups.map(g =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
          )
        }));
      },

      deleteGroup: (id) => {
        set(state => ({
          groups: state.groups.filter(g => g.id !== id),
          tasks: state.tasks.filter(t => t.groupId !== id),
        }));
      },

      archiveGroup: (id) => {
        set(state => ({
          groups: state.groups.map(g => g.id === id ? { ...g, archived: !g.archived, updatedAt: new Date().toISOString() } : g)
        }));
      },

      reorderGroups: (groupIds) => {
        set(state => ({
          groups: state.groups.map(g => ({ ...g, order: groupIds.indexOf(g.id) }))
        }));
      },

      joinGroup: (inviteCode) => {
        const { groups, user } = get();
        const group = groups.find(g => g.inviteCode === inviteCode);
        if (!group || !user) return null;
        const isMember = group.members?.some(m => m.userId === user.id);
        if (!isMember) {
          get().addGroupMember(group.id, user.id, user.name, user.email, 'member');
        }
        return group;
      },

      addGroupMember: (groupId, userId, name, email, role = 'member') => {
        set(state => ({
          groups: state.groups.map(g =>
            g.id === groupId
              ? { ...g, members: [...(g.members ?? []), { userId, name, email, role, joinedAt: new Date().toISOString() }], updatedAt: new Date().toISOString() }
              : g
          )
        }));
      },

      sendChatMessage: (groupId, content) => {
        const { user } = get();
        if (!user) return;
        const message: ChatMessage = {
          id: uuidv4(),
          groupId,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          content,
          createdAt: new Date().toISOString(),
        };
        set(state => ({ chatMessages: [...state.chatMessages, message] }));
      },

      addCalendarEvent: (eventData) => {
        const { user } = get();
        const event: CalendarEvent = {
          id: uuidv4(),
          ...eventData,
          userId: user?.id ?? 'guest',
          createdAt: new Date().toISOString(),
        };
        set(state => ({ calendarEvents: [...state.calendarEvents, event] }));
        return event;
      },

      updateCalendarEvent: (id, updates) => {
        set(state => ({ calendarEvents: state.calendarEvents.map(e => e.id === id ? { ...e, ...updates } : e) }));
      },

      deleteCalendarEvent: (id) => {
        set(state => ({ calendarEvents: state.calendarEvents.filter(e => e.id !== id) }));
      },

      addFocusSession: (session) => {
        const { user } = get();
        set(state => ({
          focusSessions: [...state.focusSessions, { id: uuidv4(), ...session, userId: user?.id ?? 'guest' }]
        }));
      },

      addNotification: (notification) => {
        set(state => ({
          notifications: [{ id: uuidv4(), ...notification, createdAt: new Date().toISOString() }, ...state.notifications]
        }));
      },

      markNotificationRead: (id) => {
        set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
      },

      markAllNotificationsRead: () => {
        set(state => ({ notifications: state.notifications.map(n => ({ ...n, read: true })) }));
      },

      clearNotifications: () => set({ notifications: [] }),

      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveGroupId: (id) => set({ activeGroupId: id }),
      setSelectedDate: (date) => set({ selectedDate: date }),

      exportData: () => {
        const { tasks, groups, calendarEvents, focusSessions } = get();
        return JSON.stringify({ tasks, groups, calendarEvents, focusSessions, exportedAt: new Date().toISOString() }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.tasks) set(state => ({ tasks: [...state.tasks, ...data.tasks] }));
          if (data.groups) set(state => ({ groups: [...state.groups, ...data.groups] }));
          if (data.calendarEvents) set(state => ({ calendarEvents: [...state.calendarEvents, ...data.calendarEvents] }));
          return true;
        } catch {
          return false;
        }
      },

      getTasksByGroup: (groupId) => get().tasks.filter(t => t.groupId === groupId && !t.deletedAt),
      getTasksForDate: (date) => get().tasks.filter(t => t.dueDate === date && !t.deletedAt),
      getUpcomingTasks: (days = 7) => {
        const now = new Date();
        const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        return get().tasks.filter(t => {
          if (!t.dueDate || t.completed || t.deletedAt) return false;
          const d = new Date(t.dueDate);
          return d >= now && d <= future;
        }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
      },
      getGroupProgress: (groupId) => {
        const tasks = get().getTasksByGroup(groupId);
        const completed = tasks.filter(t => t.completed).length;
        return { total: tasks.length, completed, percentage: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100) };
      },
      getUserTasks: () => get().tasks.filter(t => !t.deletedAt),
      getUnreadNotificationsCount: () => get().notifications.filter(n => !n.read).length,
    }),
    {
      name: 'space-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isGuest: state.isGuest,
        onboardingComplete: state.onboardingComplete,
        tasks: state.tasks,
        groups: state.groups,
        calendarEvents: state.calendarEvents,
        focusSessions: state.focusSessions,
        notifications: state.notifications,
        chatMessages: state.chatMessages,
        activityFeed: state.activityFeed,
        deletedTasks: state.deletedTasks,
      }),
    }
  )
);
