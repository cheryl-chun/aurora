import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '../../utils/toast';
import { useSelectionTranslateShortcut } from '../../hooks/useSelectionTranslateShortcut';
import type { AppSettings } from '../../types/settings';
import { useTranslation } from 'react-i18next';
import type { TokenUsage, TranslateResponse } from '../../types/translate';
import TokenUsageView from '../../components/TokenUsage';
import { formatErrorMessage } from '../../utils/error';

const languages = [
  { value: 'auto', label: '自动检测' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en', label: '英语' },
  { value: 'ja', label: '日语' },
  { value: 'ko', label: '韩语' },
  { value: 'fr', label: '法语' },
  { value: 'de', label: '德语' },
];

function TranslatePage({ settings }: { settings: AppSettings }) {
  const [sourceLanguage, setSourceLanguage] = useState(settings.sourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(settings.targetLanguage);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<TokenUsage | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    setSourceLanguage(settings.sourceLanguage);
    setTargetLanguage(settings.targetLanguage);
  }, [settings.sourceLanguage, settings.targetLanguage]);

  useSelectionTranslateShortcut({
    shortcut: settings.selectionShortcut,
    appendShortcut: settings.appendSelectionShortcut,
    sourceLanguage,
    targetLanguage,
  });

  async function handleTranslate() {
    const text = sourceText.trim();

    if (!text) {
      toast.info(t('toast.inputRequired'));
      return;
    }

    setTranslatedText('');
    setUsage(null);
    setLoading(true);

    try {
      const result = await invoke<TranslateResponse>('translate_text', {
        text,
        sourceLanguage,
        targetLanguage,
      });

      setTranslatedText(result.content);
      setUsage(result.usage ?? null);
    } catch (error) {
      toast.error(t('toast.translateFailed', { message: formatErrorMessage(error) }));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!translatedText.trim()) {
      toast.info(t('toast.noResultToCopy'));
      return;
    }

    try {
      await navigator.clipboard.writeText(translatedText);
      toast.success(t('toast.copied'));
    } catch (error) {
      toast.error(t('toast.translateFailed', { message: formatErrorMessage(error) }));
    }
  }

  function handleClear() {
    setSourceText('');
    setUsage(null);
    setTranslatedText('');
  }

  return (
    <div className="flex min-h-full flex-col px-8 py-7">
      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <h1>{t('translate.title')}</h1>
          <p>{t('translate.description')}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="select-wrap min-w-32">
            <select
              value={sourceLanguage}
              onChange={event => setSourceLanguage(event.currentTarget.value)}
              className="select-input"
            >
              {languages.map(language => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-400">→</span>

          <div className="select-wrap min-w-32">
            <select
              value={targetLanguage}
              onChange={event => setTargetLanguage(event.currentTarget.value)}
              className="select-input"
            >
              {languages
                .filter(language => language.value !== 'auto')
                .map(language => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex h-11 items-center justify-between border-b border-slate-100 px-4 text-sm text-slate-500">
            <span>{t('translate.source')}</span>
            <span>{t('translate.characters', { count: sourceText.length })}</span>
          </div>

          <textarea
            value={sourceText}
            onChange={event => setSourceText(event.currentTarget.value)}
            placeholder={t('translate.inputPlaceholder')}
            className="min-h-0 flex-1 resize-none border-0 bg-white p-4 text-sm leading-7 text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex h-11 items-center justify-between gap-3 border-b border-slate-100 px-4 text-sm text-slate-500">
            <div className="flex min-w-0 items-center gap-3">
              <span>{t('translate.result')}</span>
              <TokenUsageView usage={usage} />
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
            >
              {t('common.copy')}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-4 text-sm leading-7 text-slate-950">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                  <span>{t('translate.translating')}</span>
                </div>
              </div>
            ) : translatedText ? (
              translatedText
            ) : (
              <span className="text-slate-400">{t('translate.resultPlaceholder')}</span>
            )}
          </div>
        </div>
      </section>

      <footer className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={handleClear}
          className="h-9 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
        >
          {t('translate.clear')}
        </button>

        <button
          type="button"
          onClick={handleTranslate}
          disabled={loading}
          className="h-9 rounded-md bg-slate-950 px-5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t('translate.translating') : t('translate.translate')}
        </button>
      </footer>
    </div>
  );
}

export default TranslatePage;
