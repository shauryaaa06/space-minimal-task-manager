import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Users, Focus, Settings } from '../components/ui/Icons';
import HomePage from './HomePage';
import CalendarPage from './CalendarPage';
import GroupsPage from './GroupsPage';
import FocusPage from './FocusPage';
import SettingsPage from './SettingsPage';

type Tab = 'home' | 'calendar' | 'groups' | 'focus' | 'settings';

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const tabs = [
    { id: 'home' as Tab, label: 'Home', Icon: Home },
    { id: 'calendar' as Tab, label: 'Calendar', Icon: Calendar },
    { id: 'groups' as Tab, label: 'Groups', Icon: Users },
    { id: 'focus' as Tab, label: 'Focus', Icon: Focus },
    { id: 'settings' as Tab, label: 'Settings', Icon: Settings },
  ];

  const pageVariants = {
    enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 30 : -30 }),
    center: { opacity: 1, x: 0 },
    exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -30 : 30 }),
  };

  const tabOrder = tabs.map(t => t.id);
  const currentIndex = tabOrder.indexOf(activeTab);
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const direction = currentIndex >= prevIndex ? 1 : -1;

  const handleTabChange = (tab: Tab) => {
    setPrevIndex(tabOrder.indexOf(activeTab));
    setActiveTab(tab);
  };

  const PageComponents: Record<Tab, React.ComponentType> = {
    home: HomePage,
    calendar: CalendarPage,
    groups: GroupsPage,
    focus: FocusPage,
    settings: SettingsPage,
  };

  const ActivePage = PageComponents[activeTab];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 overflow-y-auto"
          >
            <ActivePage />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div
        className="flex-shrink-0 flex items-center justify-around px-2 border-t"
        style={{
          background: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
          height: 'var(--nav-height)',
          paddingBottom: 'var(--safe-bottom)',
        }}
      >
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className="nav-item relative"
              style={{
                color: isActive ? 'var(--accent-500)' : 'var(--text-tertiary)',
                flex: 1,
              }}
            >
              <motion.div
                animate={{ scale: isActive ? 1 : 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex flex-col items-center gap-1"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'var(--accent-100)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative">
                  <Icon active={isActive} />
                </span>
                <span
                  className="text-xs font-medium relative"
                  style={{ color: isActive ? 'var(--accent-500)' : 'var(--text-tertiary)' }}
                >
                  {label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
