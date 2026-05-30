import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { toast } from '../../utils/toast';
import { Pin, PinOff } from 'lucide-react';
import Toast from '../../components/Toast';
import { defaultSettings, type AppSettings } from '../../types/settings';
import { useTranslation } from 'react-i18next';

type PopupPayload = {
  status: 'translating' | 'done' | 'error';
  sourceText?: string;
  translatedText?: string;
  error?: string;
};

type ResizeDirection =
  | 'East'
  | 'North'
  | 'NorthEast'
  | 'NorthWest'
  | 'South'
  | 'SouthEast'
  | 'SouthWest'
  | 'West';

function PopupPage() {
  const [payload, setPayload] = useState<PopupPayload | null>(null);
  const [pinned, setPinned] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const appWindow = getCurrentWindow();

  const { t } = useTranslation();

  useEffect(() => {
    let disposed = false;

    invoke<AppSettings>('load_app_settings')
      .then(setSettings)
      .catch(error => console.error('[popup] load settings failed', error));

    async function loadSnapshot() {
      try {
        const snapshot = await invoke<PopupPayload | null>('get_popup_payload');

        if (!disposed) {
          console.log('[popup] snapshot', snapshot);
          setPayload(snapshot);
        }
      } catch (error) {
        console.error('[popup] load snapshot failed', error);
      }
    }

    const unlistenPayload = listen<PopupPayload>('aurora://popup-payload', event => {
      console.log('[popup] payload event', event.payload);
      setPayload(event.payload);
    });

    const unlistenCleared = listen('aurora://popup-payload-cleared', () => {
      console.log('[popup] payload cleared');
      setPayload(null);
    });

    const unlistenPromise = appWindow.onFocusChanged(async ({ payload }) => {
      if (!payload && !pinned) {
        await closePopup();
      }
    });

    loadSnapshot();

    return () => {
      disposed = true;
      unlistenPayload.then(unlisten => unlisten());
      unlistenCleared.then(unlisten => unlisten());
      unlistenPromise.then(unlisten => unlisten());
    };
  }, [pinned]);

  async function copyTranslatedText() {
    const text = payload?.translatedText?.trim();

    if (!text) {
      toast.info(t('popup.noResultToCopy'));
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('popup.copied'));
    } catch (error) {
      console.error('[popup] copy failed', error);
      toast.error(t('popup.copyFailed', { message: String(error) }));
    }
  }

  async function startResize(direction: ResizeDirection) {
    try {
      await appWindow.startResizeDragging(direction);
    } catch (error) {
      console.error('[popup] resize dragging failed', error);
    }
  }

  async function handleStartDrag() {
    try {
      await appWindow.startDragging();
    } catch (error) {
      console.error('[popup] start dragging failed', error);
    }
  }

  async function closePopup() {
    try {
      setPinned(false);
      await invoke('clear_popup_payload');
      await appWindow.hide();
    } catch (error) {
      console.error('[popup] hide failed', error);
    }
  }

  return (
    <>
      <Toast />

      <main className="relative h-screen overflow-hidden rounded-lg bg-white text-slate-950 shadow-xl">
        <div className="flex h-full flex-col">
          <header className="flex h-12 items-center border-b border-slate-100 bg-white">
            <div
              onMouseDown={handleStartDrag}
              className="flex h-full min-w-0 flex-1 cursor-move items-center px-4"
            >
              <h1 className="truncate text-sm font-semibold">{t('popup.title')}</h1>
            </div>

            <div className="flex h-full shrink-0 items-center gap-1 px-2">
              <button
                type="button"
                onClick={() => setPinned(value => !value)}
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100',
                  pinned ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900',
                ].join(' ')}
                aria-label={pinned ? t('popup.unpin') : t('popup.pin')}
                title={pinned ? t('popup.unpin') : t('popup.pin')}
              >
                {pinned ? <PinOff size={17} /> : <Pin size={17} />}
              </button>
              <button
                type="button"
                onClick={copyTranslatedText}
                disabled={!payload?.translatedText?.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30"
                aria-label={t('popup.copyResult')}
                title={t('popup.copyResult')}
              >
                ⧉
              </button>

              <button
                type="button"
                onClick={closePopup}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label={t('common.close')}
                title={t('common.close')}
              >
                ×
              </button>
            </div>
          </header>

          <section className="min-h-0 flex-1 overflow-auto px-5 py-3 pb-5">
            {!payload && <EmptyState />}

            {payload && (
              <div className="grid gap-3">
                {settings.showSourceText && payload.sourceText && (
                  <>
                    <TextBlock text={payload.sourceText} muted />
                    <div className="h-px bg-slate-100" />
                  </>
                )}

                {payload.status === 'translating' && <LoadingText text={t('popup.translating')} />}

                {payload.status === 'done' && <TextBlock text={payload.translatedText ?? ''} />}

                {payload.status === 'error' && (
                  <div className="rounded-md bg-red-50 p-3 text-sm leading-6 text-red-700">
                    {payload.error}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
        <ResizeHandle
          direction="West"
          className="bottom-6 left-0 top-12 w-3 cursor-w-resize"
          onResize={startResize}
        />

        <ResizeHandle
          direction="East"
          className="bottom-6 right-0 top-12 w-3 cursor-e-resize"
          onResize={startResize}
        />

        <ResizeHandle
          direction="South"
          className="bottom-0 left-6 right-6 h-3.5 cursor-s-resize"
          onResize={startResize}
        />

        <ResizeHandle
          direction="SouthWest"
          className="bottom-0 left-0 h-6 w-6 cursor-sw-resize"
          onResize={startResize}
        />

        <ResizeHandle
          direction="SouthEast"
          className="bottom-0 right-0 h-6 w-6 cursor-se-resize"
          onResize={startResize}
        />
      </main>
    </>
  );
}

function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      {t('popup.waiting')}
    </div>
  );
}

function LoadingText({ text }: { text: string }) {
  return (
    <div className="flex items-center text-sm text-slate-400">
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
        <span>{text}</span>
      </div>
    </div>
  );
}

function TextBlock({ text, muted = false }: { text: string; muted?: boolean }) {
  const { t } = useTranslation();
  return (
    <p
      className={[
        'whitespace-pre-wrap text-sm leading-6',
        muted ? 'text-slate-500' : 'text-slate-950',
      ].join(' ')}
    >
      {text || t('common.empty')}
    </p>
  );
}

function ResizeHandle({
  direction,
  className,
  onResize,
}: {
  direction: ResizeDirection;
  className: string;
  onResize: (direction: ResizeDirection) => void;
}) {
  return (
    <div
      className={`absolute z-20 ${className}`}
      onMouseDown={event => {
        event.preventDefault();
        onResize(direction);
      }}
    />
  );
}

export default PopupPage;
