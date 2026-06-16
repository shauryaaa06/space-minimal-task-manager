import { motion } from 'framer-motion';
import { useStore } from '../../store';
import type { Group } from '../../types';

interface GroupCardProps {
  group: Group;
  compact?: boolean;
  onPress?: (group: Group) => void;
  selected?: boolean;
}

export default function GroupCard({ group, compact, onPress, selected }: GroupCardProps) {
  const { getGroupProgress } = useStore();
  const { total, completed, percentage } = getGroupProgress(group.id);

  if (compact) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onPress?.(group)}
        className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl w-20"
        style={{
          background: selected ? `${group.color}20` : 'var(--bg-secondary)',
          border: selected ? `2px solid ${group.color}` : '2px solid transparent',
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl relative"
          style={{ background: `${group.color}20` }}
        >
          <span>{group.icon}</span>
          {total > 0 && (
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
              style={{ background: group.color, fontSize: '9px', fontWeight: 'bold' }}
            >
              {total - completed}
            </div>
          )}
        </div>
        <p className="text-xs font-medium text-center leading-tight line-clamp-2"
          style={{ color: 'var(--text-primary)', maxWidth: '64px' }}>
          {group.name}
        </p>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onPress?.(group)}
      className="w-full p-4 rounded-2xl text-left mb-3"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid var(--border-color)`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${group.color}20` }}
        >
          {group.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {group.name}
            </p>
            <div className="flex items-center gap-2">
              {group.isShared && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: `${group.color}15` }}>
                  <span className="text-xs font-medium" style={{ color: group.color }}>Shared</span>
                </div>
              )}
              <span className="text-xs font-semibold" style={{ color: group.color }}>{percentage}%</span>
            </div>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {completed}/{total} tasks completed
          </p>
          {total > 0 && (
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%`, background: group.color }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
