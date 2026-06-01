export type AppLanguage = 'zh-CN' | 'en';
export type AppSettings = {
  selectionShortcut: string;
  appendSelectionShortcut: string;
  sourceLanguage: string;
  targetLanguage: string;
  showSourceText: boolean;
  appLanguage: AppLanguage;
};

export const defaultSettings: AppSettings = {
  selectionShortcut: 'CommandOrControl+Shift+E',
  appendSelectionShortcut: 'CommandOrControl+Shift+A',
  sourceLanguage: 'auto',
  targetLanguage: 'zh-CN',
  showSourceText: false,
  appLanguage: 'zh-CN',
};
