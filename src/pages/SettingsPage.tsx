import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Palette, Bell, Database, Shield, Info,
  ChevronRight, LogOut, Trash2, Download, Upload,
  Check, Moon, Sun, Zap, Camera, Clock
} from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import { applyTheme, getThemeDisplayName, getThemeColor } from '../utils';
import type { ThemePreset, ColorScheme } from '../types';

type SettingsSection = 'main' | 'appearance' | 'account' | 'notifications' | 'focus' | 'data' | 'about' | 'deleted';

export default function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>('main');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const { user, isGuest, logout, deleteAccount, updateSettings, updateUser, exportData, importData, deletedTasks, restoreTask, permanentlyDeleteTask } = useStore();
  const { showToast } = useToast();
  const settings = user?.settings;

  const themes: ThemePreset[] = ['ocean', 'midnight', 'forest', 'lavender', 'sunset', 'monochrome', 'rose'];

  const handleThemeChange = (theme: ThemePreset) => {
    updateSettings({ theme });
    applyTheme(theme, settings?.colorScheme ?? 'light');
  };

  const handleSchemeChange = (scheme: ColorScheme) => {
    updateSettings({ colorScheme: scheme });
    applyTheme(settings?.theme ?? 'ocean', scheme);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `space-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const json = ev.target?.result as string;
        if (importData(json)) showToast('Data imported successfully');
        else showToast('Failed to import data', 'error');
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSaveName = () => {
    if (newName.trim()) {
      updateUser({ name: newName.trim() });
      showToast('Name updated');
    }
    setEditingName(false);
  };

  const SettingRow = ({
    label, value, onClick, icon, danger = false, toggle, toggled
  }: {
    label: string; value?: string; onClick?: () => void; icon?: React.ReactNode;
    danger?: boolean; toggle?: boolean; toggled?: boolean;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 transition-all"
      style={{ color: danger ? '#ef4444' : 'var(--text-primary)' }}
    >
      {icon && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: danger ? '#fee2e2' : 'var(--bg-tertiary)', color: danger ? '#ef4444' : 'var(--accent-500)' }}>
          {icon}
        </div>
      )}
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      {toggle ? (
        <div className="relative w-12 h-7 rounded-full" style={{ background: toggled ? 'var(--accent-500)' : 'var(--bg-tertiary)' }}>
          <div className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all"
            style={{ left: toggled ? '22px' : '2px' }} />
        </div>
      ) : value ? (
        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{value}</span>
      ) : onClick ? (
        <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
      ) : null}
    </button>
  );

  const SectionContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="mx-5 mb-4 rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      {children}
    </div>
  );

  const Divider = () => <div className="mx-4 h-px" style={{ background: 'var(--border-color)' }} />;

  if (section === 'appearance') {
    return (
      <div style={{ paddingBottom: 'calc(80px + 24px)' }}>
        <div className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button onClick={() => setSection('main')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
            <ChevronRight className="w-5 h-5 rotate-180" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Appearance</h1>
        </div>

        <div className="px-5 mb-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>COLOR SCHEME</p>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'light' as ColorScheme, label: 'Light', icon: <Sun className="w-5 h-5" /> },
              { value: 'dark' as ColorScheme, label: 'Dark', icon: <Moon className="w-5 h-5" /> },
              { value: 'amoled' as ColorScheme, label: 'AMOLED', icon: <Zap className="w-5 h-5" /> },
            ]).map(opt => (
              <button key={opt.value} onClick={() => handleSchemeChange(opt.value)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                style={{ borderColor: settings?.colorScheme === opt.value ? 'var(--accent-500)' : 'var(--border-color)', background: settings?.colorScheme === opt.value ? 'var(--accent-100)' : 'var(--bg-secondary)' }}>
                <span style={{ color: settings?.colorScheme === opt.value ? 'var(--accent-500)' : 'var(--text-secondary)' }}>{opt.icon}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{opt.label}</span>
                {settings?.colorScheme === opt.value && <Check className="w-3 h-3" style={{ color: 'var(--accent-500)' }} />}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 mb-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>COLOR THEME</p>
          <div className="grid grid-cols-4 gap-3">
            {themes.map(theme => (
              <button key={theme} onClick={() => handleThemeChange(theme)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all"
                style={{ borderColor: settings?.theme === theme ? getThemeColor(theme) : 'var(--border-color)', background: settings?.theme === theme ? `${getThemeColor(theme)}15` : 'var(--bg-secondary)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: getThemeColor(theme) }}>
                  {settings?.theme === theme && <Check className="w-5 h-5 text-white" />}
                </div>
                <span className="text-xs font-medium text-center leading-tight" style={{ color: 'var(--text-primary)', fontSize: '10px' }}>
                  {getThemeDisplayName(theme).split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section === 'focus') {
    const nums = [5, 10, 15, 20, 25, 30, 45, 60];
    return (
      <div style={{ paddingBottom: 'calc(80px + 24px)' }}>
        <div className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button onClick={() => setSection('main')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
            <ChevronRight className="w-5 h-5 rotate-180" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Focus Settings</h1>
        </div>

        {[
          { key: 'focusDuration', label: 'Focus Duration', suffix: 'min' },
          { key: 'breakDuration', label: 'Short Break', suffix: 'min' },
          { key: 'longBreakDuration', label: 'Long Break', suffix: 'min' },
        ].map(({ key, label, suffix }) => (
          <div key={key} className="px-5 mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              {label.toUpperCase()} · {settings?.[key as keyof typeof settings]} {suffix}
            </p>
            <div className="flex flex-wrap gap-2">
              {nums.map(n => (
                <button key={n} onClick={() => updateSettings({ [key]: n })}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: settings?.[key as keyof typeof settings] === n ? 'var(--accent-500)' : 'var(--bg-secondary)',
                    color: settings?.[key as keyof typeof settings] === n ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${settings?.[key as keyof typeof settings] === n ? 'var(--accent-500)' : 'var(--border-color)'}`,
                  }}>
                  {n}m
                </button>
              ))}
            </div>
          </div>
        ))}

        <SectionContainer>
          <SettingRow label="Sound Effects" icon={<Bell className="w-4 h-4" />}
            toggle toggled={settings?.soundEnabled !== false}
            onClick={() => updateSettings({ soundEnabled: !settings?.soundEnabled })} />
        </SectionContainer>
      </div>
    );
  }

  if (section === 'deleted') {
    return (
      <div style={{ paddingBottom: 'calc(80px + 24px)' }}>
        <div className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button onClick={() => setSection('main')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
            <ChevronRight className="w-5 h-5 rotate-180" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Recently Deleted</h1>
        </div>
        <div className="px-5">
          {deletedTasks.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <Trash2 className="w-12 h-12 mb-3" style={{ color: 'var(--text-tertiary)', opacity: 0.4 }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No deleted tasks</p>
            </div>
          ) : (
            deletedTasks.map(task => (
              <div key={task.id} className="p-4 rounded-2xl mb-2 flex items-center gap-3"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    Deleted {task.deletedAt ? new Date(task.deletedAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { restoreTask(task.id); showToast('Task restored'); }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: 'var(--accent-100)', color: 'var(--accent-500)' }}>
                    Restore
                  </button>
                  <button onClick={() => permanentlyDeleteTask(task.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: '#fee2e2', color: '#ef4444' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Main Settings
  return (
    <div style={{ paddingBottom: 'calc(80px + 24px)' }}>
      {/* Profile Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() ?? '?'
              )}
            </div>
          </div>
          <div className="flex-1">
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="input text-sm flex-1"
                  style={{ padding: '8px 12px' }}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                />
                <button onClick={handleSaveName} className="px-3 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: 'var(--accent-500)' }}>Save</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {user?.name ?? 'Guest'}
                  </h2>
                  {!isGuest && (
                    <button onClick={() => { setNewName(user?.name ?? ''); setEditingName(true); }}
                      className="text-xs font-medium" style={{ color: 'var(--accent-500)' }}>Edit</button>
                  )}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {isGuest ? 'Guest Account' : user?.email}
                </p>
                <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-tertiary)' }}>
                  {user?.userType} · {user?.settings.theme} theme
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Appearance */}
      <p className="px-5 text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>APPEARANCE</p>
      <SectionContainer>
        <SettingRow label="Theme & Colors" icon={<Palette className="w-4 h-4" />}
          value={getThemeDisplayName(settings?.theme ?? 'ocean')}
          onClick={() => setSection('appearance')} />
      </SectionContainer>

      {/* Tasks */}
      <p className="px-5 text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>TASKS</p>
      <SectionContainer>
        <SettingRow label="Show Completed Tasks" icon={<Check className="w-4 h-4" />}
          toggle toggled={settings?.showCompletedTasks !== false}
          onClick={() => updateSettings({ showCompletedTasks: !settings?.showCompletedTasks })} />
        <Divider />
        <SettingRow label="Recently Deleted" icon={<Trash2 className="w-4 h-4" />}
          value={`${deletedTasks.length} items`}
          onClick={() => setSection('deleted')} />
      </SectionContainer>

      {/* Focus */}
      <p className="px-5 text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>FOCUS</p>
      <SectionContainer>
        <SettingRow label="Focus Settings" icon={<Clock className="w-4 h-4" />}
          value={`${settings?.focusDuration ?? 25}m focus`}
          onClick={() => setSection('focus')} />
        <Divider />
        <SettingRow label="Sound Effects" icon={<Bell className="w-4 h-4" />}
          toggle toggled={settings?.soundEnabled !== false}
          onClick={() => updateSettings({ soundEnabled: !settings?.soundEnabled })} />
      </SectionContainer>

      {/* Notifications */}
      <p className="px-5 text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>NOTIFICATIONS</p>
      <SectionContainer>
        <SettingRow label="Push Notifications" icon={<Bell className="w-4 h-4" />}
          toggle toggled={settings?.notifications !== false}
          onClick={() => updateSettings({ notifications: !settings?.notifications })} />
      </SectionContainer>

      {/* Data */}
      <p className="px-5 text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>DATA</p>
      <SectionContainer>
        <SettingRow label="Export Data" icon={<Download className="w-4 h-4" />} onClick={handleExport} />
        <Divider />
        <SettingRow label="Import Data" icon={<Upload className="w-4 h-4" />} onClick={handleImport} />
      </SectionContainer>

      {/* About */}
      <p className="px-5 text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>ABOUT</p>
      <SectionContainer>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Space</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Version 1.0.0</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))' }}>
              <span className="text-white text-sm font-bold">S</span>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>
            Designed & Developed by Shaurya Sehgal
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Clear mind. Clear space.
          </p>
        </div>
      </SectionContainer>

      {/* Account */}
      <p className="px-5 text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>ACCOUNT</p>
      <SectionContainer>
        <SettingRow label={isGuest ? 'Create Account' : 'Sign Out'} icon={<LogOut className="w-4 h-4" />}
          onClick={() => setShowLogoutConfirm(true)} />
        {!isGuest && (
          <>
            <Divider />
            <SettingRow label="Delete Account" icon={<Trash2 className="w-4 h-4" />} danger
              onClick={() => setShowDeleteConfirm(true)} />
          </>
        )}
      </SectionContainer>

      {/* Logout Confirm */}
      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Sign Out">
        <div className="px-6 pb-6">
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {isGuest ? 'You\'ll lose all data as a guest. Create an account to save your data.' : 'You will be signed out of your account.'}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { logout(); setShowLogoutConfirm(false); }}
              className="btn-primary w-full" style={{ padding: '14px' }}>
              {isGuest ? 'Sign Out Anyway' : 'Sign Out'}
            </button>
            <button onClick={() => setShowLogoutConfirm(false)}
              className="btn-secondary w-full" style={{ padding: '14px' }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Account">
        <div className="px-6 pb-6">
          <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
            This action cannot be undone.
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            All your tasks, groups, and data will be permanently deleted.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { deleteAccount(); setShowDeleteConfirm(false); }}
              className="w-full py-4 rounded-2xl font-semibold text-sm text-white"
              style={{ background: '#ef4444' }}>
              Delete My Account
            </button>
            <button onClick={() => setShowDeleteConfirm(false)}
              className="btn-secondary w-full" style={{ padding: '14px' }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
