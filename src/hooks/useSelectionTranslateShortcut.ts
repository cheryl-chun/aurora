import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { isRegistered, register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { toast } from '../utils/toast';

type Options = {
  sourceLanguage: string;
  targetLanguage: string;
  shortcut: string;
  appendShortcut: string;
};

export function useSelectionTranslateShortcut(options: Options) {
  const runningRef = useRef(false);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options.appendShortcut, options.shortcut, options.sourceLanguage, options.targetLanguage]);

  useEffect(() => {
    let disposed = false;
    const shortcut = options.shortcut.trim();
    const appendShortcut = options.appendShortcut.trim();
    const shortcuts = [
      { value: shortcut, append: false },
      { value: appendShortcut, append: true },
    ].filter(({ value }, index, array) => {
      return value && array.findIndex(item => item.value === value) === index;
    });

    if (shortcuts.length === 0) {
      return;
    }

    async function handleShortcut(append: boolean) {
      if (runningRef.current) {
        log('skip: already running');
        return;
      }

      runningRef.current = true;
      log('pressed');

      try {
        await ensurePopupWindow();

        log('selection translate start');
        await invoke('translate_selected_text_in_popup', {
          sourceLanguage: optionsRef.current.sourceLanguage,
          targetLanguage: optionsRef.current.targetLanguage,
          append,
        });
        log('selection translate done');
      } catch (error) {
        console.error('[selection-shortcut] failed', error);

        toast.error(`划词翻译失败：${String(error)}`);
      } finally {
        runningRef.current = false;
        log('done');
      }
    }

    async function setup() {
      try {
        for (const item of shortcuts) {
          log('register start', item);

          if (await isRegistered(item.value)) {
            await unregister(item.value);
            log('unregistered old shortcut', item.value);
          }

          if (disposed) {
            return;
          }

          await register(item.value, event => {
            log('event', event);

            if (event.state === 'Pressed') {
              window.setTimeout(() => {
                handleShortcut(item.append);
              }, 300);
            }
          });

          log('registered', item.value);
        }
      } catch (error) {
        console.error('[selection-shortcut] register failed', error);
        toast.error(`注册快捷键失败：${String(error)}`);
      }
    }

    setup();

    return () => {
      disposed = true;

      shortcuts.forEach(item => {
        unregister(item.value).catch(error => {
          console.warn('[selection-shortcut] unregister failed', error);
        });
      });
    };
  }, [options.appendShortcut, options.shortcut]);
}

async function ensurePopupWindow() {
  const existing = await WebviewWindow.getByLabel('translate-popup');

  if (existing) {
    return existing;
  }

  const popup = new WebviewWindow('translate-popup', {
    url: '/',
    title: 'Aurora 翻译',
    width: 420,
    height: 320,
    minWidth: 360,
    minHeight: 240,
    resizable: true,
    decorations: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    visible: false,
    focus: false,
  });

  return new Promise<WebviewWindow>((resolve, reject) => {
    popup.once('tauri://created', () => resolve(popup));
    popup.once('tauri://error', event => reject(event.payload));
  });
}

function log(message: string, payload?: unknown) {
  console.log(`[selection-shortcut] ${message}`, payload ?? '');
}
