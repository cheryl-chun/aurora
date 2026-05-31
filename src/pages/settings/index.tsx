import { invoke } from '@tauri-apps/api/core';
import { toast } from '../../utils/toast';
import type { AppLanguage, AppSettings } from '../../types/settings';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const languages = [
  { value: 'auto', labelKey: 'languages.auto' },
  { value: 'zh-CN', labelKey: 'languages.zh-CN' },
  { value: 'en', labelKey: 'languages.en' },
  { value: 'ja', labelKey: 'languages.ja' },
  { value: 'ko', labelKey: 'languages.ko' },
  { value: 'fr', labelKey: 'languages.fr' },
  { value: 'de', labelKey: 'languages.de' },
];

const appLanguages: Array<{ value: AppLanguage; labelKey: string }> = [
  { value: 'zh-CN', labelKey: 'languages.zh-CN' },
  { value: 'en', labelKey: 'languages.en' },
];

function SettingsPage({
  settings,
  onSettingsChange,
}: {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}) {
  const { t } = useTranslation();
  const [recordingShortcut, setRecordingShortcut] = useState<'selection' | 'append' | null>(null);

  useEffect(() => {
    if (!recordingShortcut) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === 'Escape') {
        setRecordingShortcut(null);
        return;
      }

      const shortcut = formatShortcut(event);

      if (!shortcut || !shortcut.includes('+')) {
        return;
      }

      updateSettings({
        ...settings,
        [recordingShortcut === 'selection' ? 'selectionShortcut' : 'appendSelectionShortcut']:
          shortcut,
      });

      setRecordingShortcut(null);
    }

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [recordingShortcut, settings]);

  async function updateSettings(next: AppSettings) {
    onSettingsChange(next);
    void i18n.changeLanguage(next.appLanguage);

    try {
      await invoke('save_app_settings', { appSettings: next });
      toast.success(t('settings.saved'));
    } catch (error) {
      toast.error(t('settings.saveFailed', { message: String(error) }));
    }
  }

  return (
    <div className="flex min-h-full flex-col px-8 py-7">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">{t('settings.title')}</h1>
      </header>

      <section className="grid max-w-2xl gap-5">
        <div className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">{t('settings.selectionShortcut')}</span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRecordingShortcut('selection')}
              className={[
                'h-10 flex-1 rounded-md border px-3 text-left text-sm',
                recordingShortcut === 'selection'
                  ? 'border-slate-900 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-950 hover:bg-slate-50',
              ].join(' ')}
            >
              {recordingShortcut === 'selection'
                ? t('settings.recordingShortcut')
                : settings.selectionShortcut}
            </button>

            <button
              type="button"
              onClick={() =>
                updateSettings({
                  ...settings,
                  selectionShortcut: 'CommandOrControl+Shift+E',
                })
              }
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
            >
              {t('common.reset')}
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">{t('settings.appendShortcut')}</span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRecordingShortcut('append')}
              className={[
                'h-10 flex-1 rounded-md border px-3 text-left text-sm',
                recordingShortcut === 'append'
                  ? 'border-slate-900 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-950 hover:bg-slate-50',
              ].join(' ')}
            >
              {recordingShortcut === 'append'
                ? t('settings.recordingShortcut')
                : settings.appendSelectionShortcut}
            </button>

            <button
              type="button"
              onClick={() =>
                updateSettings({
                  ...settings,
                  appendSelectionShortcut: 'CommandOrControl+Shift+A',
                })
              }
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
            >
              {t('common.reset')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">{t('settings.sourceLanguage')}</span>
            <select
              value={settings.sourceLanguage}
              onChange={event =>
                updateSettings({ ...settings, sourceLanguage: event.currentTarget.value })
              }
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              {languages.map(item => (
                <option key={item.value} value={item.value}>
                  {t(item.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">{t('settings.targetLanguage')}</span>
            <select
              value={settings.targetLanguage}
              onChange={event =>
                updateSettings({ ...settings, targetLanguage: event.currentTarget.value })
              }
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              {languages
                .filter(item => item.value !== 'auto')
                .map(item => (
                  <option key={item.value} value={item.value}>
                    {t(item.labelKey)}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <label className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3">
          <span className="text-sm font-medium text-slate-700">{t('settings.showSourceText')}</span>
          <input
            type="checkbox"
            checked={settings.showSourceText}
            onChange={event =>
              updateSettings({ ...settings, showSourceText: event.currentTarget.checked })
            }
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">{t('settings.appLanguage')}</span>

          <select
            value={settings.appLanguage}
            onChange={event => {
              const appLanguage = event.currentTarget.value as AppLanguage;

              void i18n.changeLanguage(appLanguage);

              updateSettings({
                ...settings,
                appLanguage,
              });
            }}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            {appLanguages.map(item => (
              <option key={item.value} value={item.value}>
                {t(item.labelKey)}
              </option>
            ))}
          </select>
        </label>
      </section>
    </div>
  );
}

export default SettingsPage;

function formatShortcut(event: KeyboardEvent) {
  const parts: string[] = [];

  if (event.metaKey || event.ctrlKey) {
    parts.push('CommandOrControl');
  }

  if (event.altKey) {
    parts.push('Alt');
  }

  if (event.shiftKey) {
    parts.push('Shift');
  }

  const key = normalizeShortcutKey(event.key);

  if (!key) {
    return '';
  }

  parts.push(key);

  return parts.join('+');
}

function normalizeShortcutKey(key: string) {
  if (key === ' ') return 'Space';
  if (key === 'Escape') return '';
  if (key === 'Meta' || key === 'Control' || key === 'Alt' || key === 'Shift') return '';

  if (key.length === 1) {
    return key.toUpperCase();
  }

  const aliases: Record<string, string> = {
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    Enter: 'Enter',
    Backspace: 'Backspace',
    Delete: 'Delete',
    Tab: 'Tab',
  };

  return aliases[key] ?? key;
}
