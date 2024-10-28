import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

interface Settings {
  telegramBotToken: string;
  telegramChatId: string;
  infuraApiKey: string;
  encryptionKey: string;
  apiDomain: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    telegramBotToken: '',
    telegramChatId: '',
    infuraApiKey: '',
    encryptionKey: '',
    apiDomain: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg">
          {success}
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-lg space-y-6">
        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Telegram Bot Token</label>
            <input
              type="text"
              value={settings.telegramBotToken}
              onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telegram Chat ID</label>
            <input
              type="text"
              value={settings.telegramChatId}
              onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Infura API Key</label>
            <input
              type="text"
              value={settings.infuraApiKey}
              onChange={(e) => setSettings({ ...settings, infuraApiKey: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Encryption Key</label>
            <input
              type="password"
              value={settings.encryptionKey}
              onChange={(e) => setSettings({ ...settings, encryptionKey: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Domain</label>
            <input
              type="text"
              value={settings.apiDomain}
              onChange={(e) => setSettings({ ...settings, apiDomain: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
              placeholder="https://api.example.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;