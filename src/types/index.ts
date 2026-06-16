export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type UserType = 'student' | 'professional' | 'personal';
export type ThemePreset = 'ocean' | 'midnight' | 'forest' | 'lavender' | 'sunset' | 'monochrome' | 'rose';
export type ColorScheme = 'light' | 'dark' | 'amoled';
export type GroupRole = 'owner' | 'admin' | 'member';
export type RecurringType = 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'weekends';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  userType: UserType;
  createdAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: ThemePreset;
  colorScheme: ColorScheme;
  notifications: boolean;
  defaultView: 'list' | 'board' | 'calendar';
  weekStartsOn: 0 | 1;
  showCompletedTasks: boolean;
  defaultPriority: Priority;
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  soundEnabled: boolean;
  hapticFeedback: boolean;
  language: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  dueDate?: string;
  dueTime?: string;
  reminder?: string;
  groupId?: string;
  userId: string;
  subtasks: Subtask[];
  notes?: string;
  recurring?: RecurringType;
  tags: string[];
  order: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isShared?: boolean;
  assignedTo?: string[];
}

export interface Group {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  isShared: boolean;
  inviteCode?: string;
  inviteLink?: string;
  members?: GroupMember[];
  description?: string;
  archived: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: GroupRole;
  joinedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  color: string;
  taskId?: string;
  groupId?: string;
  userId: string;
  type: 'task' | 'event' | 'deadline' | 'milestone';
  description?: string;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  duration: number;
  type: 'focus' | 'break' | 'longBreak';
  completedAt: string;
  interrupted: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'group' | 'system' | 'reminder';
  read: boolean;
  taskId?: string;
  groupId?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  editedAt?: string;
}

export interface ActivityItem {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  action: string;
  targetType: 'task' | 'member' | 'group';
  targetTitle: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  onboardingComplete: boolean;
}

export interface AppState {
  tasks: Task[];
  groups: Group[];
  calendarEvents: CalendarEvent[];
  focusSessions: FocusSession[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  activityFeed: ActivityItem[];
  deletedTasks: Task[];
}
