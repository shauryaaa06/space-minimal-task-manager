import { useEffect, useState } from 'react';
import { useStore } from './store';
import { applyTheme } from './utils';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import MainApp from './pages/MainApp';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { user, onboardingComplete, isGuest } = useStore();
  const runAutoCleanup = useStore(s => s.runAutoCleanup);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clean up old completed/trashed tasks per the user's auto-delete settings.
    runAutoCleanup();
  }, [runAutoCleanup]);

  useEffect(() => {
    if (user?.settings) {
      applyTheme(user.settings.theme, user.settings.colorScheme);
    }
  }, [user?.settings]);

  if (!mounted) return null;

  const isAuthenticated = !!user || isGuest;

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <AuthPage />
        </motion.div>
      ) : !onboardingComplete ? (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <OnboardingPage />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <MainApp />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
