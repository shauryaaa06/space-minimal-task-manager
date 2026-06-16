import { format, isToday, isTomorrow, isYesterday, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import type { Priority, ThemePreset, ColorScheme } from '../types';

export const formatDate = (date: string | Date, fmt = 'MMM d, yyyy'): string => {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return format(d, fmt);
  } catch {
    return '';
  }
};

export const formatRelativeDate = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  } catch {
    return '';
  }
};

export const formatTimeAgo = (date: string): string => {
  try {
    const d = parseISO(date);
    if (!isValid(d)) return '';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
};

export const formatTime = (time: string, format12h = true): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  if (format12h) {
    const h = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    return `${h}:${String(minutes).padStart(2, '0')} ${ampm}`;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const getGreeting = (name?: string): string => {
  const hour = new Date().getHours();
  let greeting = 'Hello';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else if (hour < 21) greeting = 'Good evening';
  else greeting = 'Good night';
  return name ? `${greeting}, ${name.split(' ')[0]}` : greeting;
};

export const getPriorityColor = (priority: Priority): string => {
  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };
  return colors[priority];
};

export const getPriorityLabel = (priority: Priority): string => {
  const labels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return labels[priority];
};

export const getPriorityEmoji = (priority: Priority): string => {
  const emojis = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };
  return emojis[priority];
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const applyTheme = (preset: ThemePreset, scheme: ColorScheme): void => {
  const root = document.documentElement;
  const body = document.body;

  // Remove all theme classes
  body.classList.remove('dark', 'amoled');
  body.removeAttribute('data-theme');
  root.removeAttribute('data-theme');

  // Apply color scheme
  if (scheme === 'dark') {
    body.classList.add('dark');
  } else if (scheme === 'amoled') {
    body.classList.add('dark', 'amoled');
  }

  // Apply theme preset
  body.setAttribute('data-theme', preset);
  root.setAttribute('data-theme', preset);
};

export const getThemeDisplayName = (preset: ThemePreset): string => {
  const names: Record<ThemePreset, string> = {
    ocean: 'Ocean Blue',
    midnight: 'Midnight Purple',
    forest: 'Forest Green',
    lavender: 'Lavender Pink',
    sunset: 'Sunset Orange',
    monochrome: 'Monochrome',
    rose: 'Rose Red',
  };
  return names[preset];
};

export const getThemeColor = (preset: ThemePreset): string => {
  const colors: Record<ThemePreset, string> = {
    ocean: '#3b82f6',
    midnight: '#8b5cf6',
    forest: '#10b981',
    lavender: '#ec4899',
    sunset: '#f97316',
    monochrome: '#64748b',
    rose: '#f43f5e',
  };
  return colors[preset];
};

export const GROUP_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#f97316',
  '#64748b', '#f43f5e', '#06b6d4', '#84cc16', '#f59e0b',
  '#6366f1', '#14b8a6', '#a855f7', '#ef4444', '#22c55e',
];

export const GROUP_ICONS = [
  '📚', '🧮', '🔬', '✏️', '🎨', '🎵', '⚽', '💻', '🏋️', '🌿',
  '🏠', '💼', '🎯', '🚀', '📊', '🔧', '❤️', '⭐', '🌍', '🎭',
  '📱', '🎓', '🏆', '💡', '🎪', '🌈', '🍎', '🎲', '🔮', '🧩',
];

export const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, ms: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const truncate = (str: string, length: number): string =>
  str.length > length ? `${str.slice(0, length)}...` : str;

export const isOverdue = (dueDate: string): boolean => {
  // Compare date strings directly to avoid timezone parsing issues
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  return dueDate < todayStr;
};

export const isDueToday = (dueDate: string): boolean => {
  return isToday(parseISO(dueDate));
};

export const getDaysUntilDue = (dueDate: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const playSound = (type: 'complete' | 'tick' | 'break' | 'notify'): void => {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const configs = {
    complete: { freq: 520, duration: 0.3, type: 'sine' as OscillatorType },
    tick: { freq: 800, duration: 0.05, type: 'square' as OscillatorType },
    break: { freq: 440, duration: 0.5, type: 'sine' as OscillatorType },
    notify: { freq: 600, duration: 0.2, type: 'sine' as OscillatorType },
  };

  const config = configs[type];
  oscillator.type = config.type;
  oscillator.frequency.setValueAtTime(config.freq, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + config.duration);
};

export const isMobile = (): boolean => window.innerWidth < 768;

export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light'): void => {
  if ('vibrate' in navigator) {
    const patterns = { light: [10], medium: [20], heavy: [30] };
    navigator.vibrate(patterns[type]);
  }
};
