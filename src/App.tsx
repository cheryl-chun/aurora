import { useEffect, useState } from 'react';
import Sidebar, { type Page } from './components/Sidebar';
import ApiPage from './pages/api';
import TranslatePage from './pages/translate';
import SettingsPage from './pages/settings';
import AboutPage from './pages/about';
import Toast from './components/Toast';
import { getCurrentWindow } from '@tauri-apps/api/window';
import PopupPage from './pages/popup';
import { invoke } from '@tauri-apps/api/core';
import { defaultSettings, type AppSettings } from './types/settings';
import i18n from './i18n';

function App() {
  const [activePage, setActivePage] = useState<Page>('translate');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const currentWindow = getCurrentWindow();

  if (currentWindow.label === 'translate-popup') {
    return <PopupPage />;
  }

  useEffect(() => {
    const currentWindow = getCurrentWindow();

    if (currentWindow.label !== 'main') {
      return;
    }

    invoke<AppSettings>('load_app_settings')
      .then(nextSettings => {
        setSettings(nextSettings);
        void i18n.changeLanguage(nextSettings.appLanguage);
      })
      .catch(error => console.error('[settings] load failed', error));

    const unlistenPromise = currentWindow.onCloseRequested(async event => {
      event.preventDefault();
      await invoke('hide_main_window');
    });

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, []);

  function handleSettingsChange(nextSettings: AppSettings) {
    setSettings(nextSettings);
    void i18n.changeLanguage(nextSettings.appLanguage);
  }

  return (
    <>
      <Toast />

      <main className="grid h-screen grid-cols-[180px_1fr] overflow-hidden bg-slate-50 text-slate-950">
        <Sidebar activePage={activePage} onPageChange={setActivePage} />

        <section className="min-h-0 overflow-y-auto">
          <div className={activePage === 'translate' ? 'block h-full' : 'hidden'}>
            <TranslatePage settings={settings} />
          </div>

          <div className={activePage === 'api' ? 'block h-full' : 'hidden'}>
            <ApiPage />
          </div>

          <div className={activePage === 'settings' ? 'block h-full' : 'hidden'}>
            <SettingsPage settings={settings} onSettingsChange={handleSettingsChange} />
          </div>

          <div className={activePage === 'about' ? 'block h-full' : 'hidden'}>
            <AboutPage />
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
