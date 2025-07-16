import React, { useState } from 'react';

const Settings = () => {
  const [theme, setTheme] = useState('auto');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-purple-400 mb-2">Theme</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-white">
              <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} />
              Light
            </label>
            <label className="flex items-center gap-2 text-white">
              <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} />
              Dark
            </label>
            <label className="flex items-center gap-2 text-white">
              <input type="radio" name="theme" value="auto" checked={theme === 'auto'} onChange={() => setTheme('auto')} />
              Auto
            </label>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-purple-400 mb-2">Notification Preferences</h2>
          <label className="flex items-center gap-2 text-white mb-2">
            <input type="checkbox" checked={emailNotifications} onChange={() => setEmailNotifications(v => !v)} />
            Email Notifications
          </label>
          <label className="flex items-center gap-2 text-white">
            <input type="checkbox" checked={pushNotifications} onChange={() => setPushNotifications(v => !v)} />
            Push Notifications
          </label>
        </div>
        <button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings; 