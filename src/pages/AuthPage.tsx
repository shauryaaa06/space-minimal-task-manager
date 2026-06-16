import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../store';

type AuthMode = 'welcome' | 'signin' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, login, continueAsGuest } = useStore();

  const handleSignUp = async () => {
    setError('');
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const stored = localStorage.getItem('space-users');
    const users = stored ? JSON.parse(stored) : [];
    if (users.find((u: { email: string }) => u.email === email)) {
      setError('An account with this email already exists');
      setLoading(false);
      return;
    }
    const user = register(name.trim(), email.trim(), password);
    const updatedUsers = [...users, user];
    localStorage.setItem('space-users', JSON.stringify(updatedUsers));
    setLoading(false);
  };

  const handleSignIn = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password) { setError('Please enter your password'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const user = login(email.trim(), password);
    if (!user) {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  const variants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="h-full flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--accent-500), transparent)' }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--accent-400), transparent)' }} />
      </div>

      <div className="relative w-full max-w-sm px-6">
        <AnimatePresence mode="wait">
          {mode === 'welcome' && (
            <motion.div
              key="welcome"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))' }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold mb-2 tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Space
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base mb-10 text-center"
                style={{ color: 'var(--text-secondary)' }}
              >
                Clear mind. Clear space.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full flex flex-col gap-3"
              >
                <button
                  onClick={() => setMode('signup')}
                  className="btn-primary w-full text-base"
                  style={{ padding: '14px 20px' }}
                >
                  Create Account
                </button>
                <button
                  onClick={() => setMode('signin')}
                  className="btn-secondary w-full text-base"
                  style={{ padding: '14px 20px' }}
                >
                  Sign In
                </button>
                <button
                  onClick={continueAsGuest}
                  className="btn-ghost w-full text-sm"
                  style={{ padding: '12px 20px' }}
                >
                  Continue as Guest
                </button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-xs text-center"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Space v1.0 • Designed & Developed by Shaurya Sehgal
              </motion.p>
            </motion.div>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <motion.div
              key={mode}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={() => { setMode('welcome'); setError(''); setName(''); setEmail(''); setPassword(''); }}
                className="flex items-center gap-2 mb-8 text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back
              </button>

              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                {mode === 'signup' ? 'Start your productivity journey' : 'Sign in to your account'}
              </p>

              <div className="flex flex-col gap-4">
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input pl-11"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleSignUp()}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input pl-11"
                    autoFocus={mode === 'signin'}
                    onKeyDown={e => e.key === 'Enter' && (mode === 'signin' ? handleSignIn() : handleSignUp())}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input pl-11 pr-11"
                    onKeyDown={e => e.key === 'Enter' && (mode === 'signin' ? handleSignIn() : handleSignUp())}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={mode === 'signin' ? handleSignIn : handleSignUp}
                  disabled={loading}
                  className="btn-primary w-full text-base"
                  style={{ padding: '14px 20px', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                    </span>
                  ) : (
                    mode === 'signup' ? 'Create Account' : 'Sign In'
                  )}
                </button>

                <button
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                  className="text-sm text-center mt-2"
                  style={{ color: 'var(--accent-500)' }}
                >
                  {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
