import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Palette, Users, Bell, Plus, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { applyTheme, getThemeDisplayName, getThemeColor, GROUP_COLORS, GROUP_ICONS } from '../utils';
import type { ThemePreset, ColorScheme, UserType } from '../types';

const TOTAL_STEPS = 6;

const STARTER_GROUPS: Record<UserType, Array<{ name: string; color: string; icon: string }>> = {
  student: [
    { name: 'Math', color: '#3b82f6', icon: '🧮' },
    { name: 'Science', color: '#10b981', icon: '🔬' },
    { name: 'English', color: '#8b5cf6', icon: '✏️' },
    { name: 'Personal', color: '#f97316', icon: '⭐' },
  ],
  professional: [
    { name: 'Work', color: '#3b82f6', icon: '💼' },
    { name: 'Meetings', color: '#8b5cf6', icon: '📊' },
    { name: 'Personal', color: '#10b981', icon: '⭐' },
  ],
  personal: [
    { name: 'Home', color: '#3b82f6', icon: '🏠' },
    { name: 'Fitness', color: '#10b981', icon: '🏋️' },
    { name: 'Personal', color: '#f97316', icon: '⭐' },
  ],
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme>('light');
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>('ocean');
  const [selectedType, setSelectedType] = useState<UserType>('student');
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState(GROUP_COLORS[0]);
  const [groupIcon, setGroupIcon] = useState('📚');
  const [taskTitle, setTaskTitle] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { updateSettings, addGroup, addTask, completeOnboarding, user } = useStore();

  const themes: ThemePreset[] = ['ocean', 'midnight', 'forest', 'lavender', 'sunset', 'monochrome', 'rose'];

  const handleNext = () => {
    if (step === 1) {
      updateSettings({ theme: selectedTheme, colorScheme: selectedScheme });
      applyTheme(selectedTheme, selectedScheme);
    }
    if (step === 2) {
      updateSettings({ defaultPriority: 'medium' });
      // Create starter groups based on user type
      STARTER_GROUPS[selectedType].forEach(g => addGroup({ ...g, isShared: false, archived: false }));
    }
    if (step === 3 && groupName.trim()) {
      addGroup({ name: groupName.trim(), color: groupColor, icon: groupIcon, isShared: false, archived: false });
    }
    if (step === 4 && taskTitle.trim()) {
      addTask({ title: taskTitle.trim(), priority: 'medium', completed: false });
    }
    if (step === 5) {
      updateSettings({ notifications: notificationsEnabled });
      setTimeout(() => completeOnboarding(), 300);
      return;
    }
    setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const handleSkip = () => {
    if (step >= TOTAL_STEPS - 1) {
      completeOnboarding();
    } else {
      setStep(s => s + 1);
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const steps = [
    {
      icon: <Sparkles className="w-10 h-10 text-white" />,
      title: `Welcome${user?.name ? `, ${user.name.split(' ')[0]}` : ''}!`,
      subtitle: 'Space is your personal productivity hub. Let\'s set everything up.',
      canSkip: false,
    },
    {
      icon: <Palette className="w-10 h-10 text-white" />,
      title: 'Choose Your Look',
      subtitle: 'Pick a theme and color scheme that feels right for you.',
      canSkip: true,
    },
    {
      icon: <Users className="w-10 h-10 text-white" />,
      title: 'What Best Describes You?',
      subtitle: 'We\'ll set up the perfect workspace for your needs.',
      canSkip: false,
    },
    {
      icon: <Plus className="w-10 h-10 text-white" />,
      title: 'Create Your First Group',
      subtitle: 'Groups help you organize tasks by class, project, or area of life.',
      canSkip: true,
    },
    {
      icon: <Check className="w-10 h-10 text-white" />,
      title: 'Add Your First Task',
      subtitle: 'What\'s the first thing on your mind?',
      canSkip: true,
    },
    {
      icon: <Bell className="w-10 h-10 text-white" />,
      title: 'Stay on Track',
      subtitle: 'Enable notifications to get reminders for your tasks.',
      canSkip: false,
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Progress bar */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex gap-1.5 mb-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--accent-500)' }}
                initial={{ width: 0 }}
                animate={{ width: i < step ? '100%' : i === step ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Step {step + 1} of {TOTAL_STEPS}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Step icon */}
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))' }}
            >
              {currentStep.icon}
            </div>

            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {currentStep.title}
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
              {currentStep.subtitle}
            </p>

            {/* Step-specific content */}
            {step === 0 && (
              <div className="space-y-3">
                {[
                  { icon: '✅', text: 'Smart task management with priorities' },
                  { icon: '👥', text: 'Collaborative groups for team projects' },
                  { icon: '📅', text: 'Beautiful calendar to plan your days' },
                  { icon: '🎯', text: 'Focus mode to maximize productivity' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                {/* Color Scheme */}
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>APPEARANCE</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark', 'amoled'] as ColorScheme[]).map(scheme => (
                      <button
                        key={scheme}
                        onClick={() => { setSelectedScheme(scheme); applyTheme(selectedTheme, scheme); }}
                        className="p-3 rounded-2xl border-2 transition-all"
                        style={{
                          borderColor: selectedScheme === scheme ? 'var(--accent-500)' : 'var(--border-color)',
                          background: selectedScheme === scheme ? 'var(--accent-100)' : 'var(--bg-secondary)',
                        }}
                      >
                        <div className="text-xl mb-1">
                          {scheme === 'light' ? '☀️' : scheme === 'dark' ? '🌙' : '⬛'}
                        </div>
                        <p className="text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                          {scheme === 'amoled' ? 'AMOLED' : scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Preset */}
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>COLOR THEME</p>
                  <div className="grid grid-cols-4 gap-3">
                    {themes.map(theme => (
                      <button
                        key={theme}
                        onClick={() => { setSelectedTheme(theme); applyTheme(theme, selectedScheme); }}
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all"
                        style={{
                          borderColor: selectedTheme === theme ? getThemeColor(theme) : 'var(--border-color)',
                          background: selectedTheme === theme ? `${getThemeColor(theme)}15` : 'var(--bg-secondary)',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: getThemeColor(theme) }}
                        >
                          {selectedTheme === theme && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-xs font-medium text-center leading-tight" style={{ color: 'var(--text-primary)', fontSize: '10px' }}>
                          {getThemeDisplayName(theme).split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {([
                  { type: 'student' as UserType, emoji: '🎓', label: 'Student', desc: 'Classes, assignments & study groups' },
                  { type: 'professional' as UserType, emoji: '💼', label: 'Professional', desc: 'Work projects & team collaboration' },
                  { type: 'personal' as UserType, emoji: '🌿', label: 'Personal', desc: 'Life goals & personal projects' },
                ]).map(option => (
                  <button
                    key={option.type}
                    onClick={() => setSelectedType(option.type)}
                    className="w-full p-4 rounded-2xl border-2 text-left transition-all"
                    style={{
                      borderColor: selectedType === option.type ? 'var(--accent-500)' : 'var(--border-color)',
                      background: selectedType === option.type ? 'var(--accent-100)' : 'var(--bg-secondary)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{option.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{option.desc}</p>
                      </div>
                      {selectedType === option.type && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-500)' }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                <div className="p-3 rounded-2xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  We'll create starter groups for you: {STARTER_GROUPS[selectedType].map(g => `${g.icon} ${g.name}`).join(', ')}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Group name (e.g. Math, Robotics...)"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="input"
                  autoFocus
                />

                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>ICON</p>
                  <div className="grid grid-cols-8 gap-2">
                    {GROUP_ICONS.slice(0, 24).map(icon => (
                      <button
                        key={icon}
                        onClick={() => setGroupIcon(icon)}
                        className="w-10 h-10 rounded-xl text-xl transition-all flex items-center justify-center"
                        style={{
                          background: groupIcon === icon ? 'var(--accent-100)' : 'var(--bg-secondary)',
                          border: groupIcon === icon ? '2px solid var(--accent-500)' : '2px solid transparent',
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>COLOR</p>
                  <div className="flex flex-wrap gap-2">
                    {GROUP_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setGroupColor(color)}
                        className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                        style={{
                          background: color,
                          transform: groupColor === color ? 'scale(1.2)' : 'scale(1)',
                          boxShadow: groupColor === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : 'none',
                        }}
                      >
                        {groupColor === color && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="What do you need to do?"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="input text-base"
                  style={{ padding: '16px' }}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                />
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Don't worry about the details yet — you can add them later.
                </p>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div
                  className="p-5 rounded-2xl flex items-center justify-between"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Push Notifications</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Get reminders for upcoming tasks</p>
                  </div>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="relative w-12 h-7 rounded-full transition-all"
                    style={{ background: notificationsEnabled ? 'var(--accent-500)' : 'var(--bg-tertiary)' }}
                  >
                    <div
                      className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all"
                      style={{ left: notificationsEnabled ? '22px' : '2px' }}
                    />
                  </button>
                </div>

                {['Smart due date reminders', 'Group activity updates', 'Focus session alerts'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-100)' }}>
                      <Check className="w-3 h-3" style={{ color: 'var(--accent-500)' }} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="px-6 pb-10 pt-4 flex flex-col gap-3">
        <button
          onClick={handleNext}
          className="btn-primary w-full flex items-center justify-center gap-2"
          style={{ padding: '14px 20px', fontSize: '16px' }}
        >
          {step === TOTAL_STEPS - 1 ? 'Get Started' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </button>
        {currentStep.canSkip && (
          <button
            onClick={handleSkip}
            className="text-sm text-center py-2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
