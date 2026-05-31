const en = {
  common: {
    appName: 'Aurora',
    save: 'Save',
    reset: 'Reset',
    open: 'Open',
    copy: 'Copy',
    close: 'Close',
    empty: 'Empty',
  },

  sidebar: {
    translate: 'Translate',
    api: 'API',
    settings: 'Settings',
    about: 'About',
  },

  translate: {
    title: 'Translate',
    description: 'Enter text and translate it with your configured API providers.',
    source: 'Source',
    result: 'Result',
    inputPlaceholder: 'Type or paste text to translate',
    resultPlaceholder: 'Translation will appear here',
    translating: 'Translating...',
    clear: 'Clear',
    translate: 'Translate',
    characters: '{{count}} chars',
  },

  api: {
    title: 'API Management',
    description: 'Manage translation services, LLM services, and call priority.',
    add: 'Add',
    save: 'Save',
    empty: 'No API providers yet.',
    loadFailed: 'Load failed: {{message}}',
    saveSuccess: 'Saved',
    saveFailed: 'Save failed: {{message}}',

    unnamed: 'Unnamed API',
    providerTypeLlm: 'LLM',
    providerTypeTranslator: 'Translator',
    disabled: 'Disabled',
    baseUrlNotConfigured: 'Base URL is not configured',

    expandCard: 'Expand card',
    collapseCard: 'Collapse card',
    delete: 'Delete',
    dragToSort: 'Drag to reorder',

    enabled: 'Enable this API',
    name: 'Name',
    type: 'Type',
    llmApi: 'LLM API',
    translatorApi: 'Translation API',
    baseUrl: 'Base URL',
    model: 'Model',
    promptTemplate: 'Prompt template',
    promptPlaceholder: 'Use {{placeholder}} for the text to translate',
    promptHelp: 'Use {{placeholder}} as the placeholder for the text to translate.',
    apiKey: 'API Key',
  },

  popup: {
    title: 'Aurora Translate',
    waiting: 'Waiting for text',
    translating: 'Translating...',
    copyResult: 'Copy translation',
    pin: 'Pin window',
    unpin: 'Unpin window',
    noResultToCopy: 'No translation to copy',
    copied: 'Translation copied',
    copyFailed: 'Copy failed: {{message}}',
  },

  settings: {
    title: 'Settings',
    selectionShortcut: 'Selection translate shortcut',
    appendShortcut: 'Append selection shortcut',
    recordingShortcut: 'Press a new shortcut...',
    sourceLanguage: 'Default source language',
    targetLanguage: 'Default target language',
    showSourceText: 'Show source text in popup',
    appLanguage: 'Display language',
    saved: 'Settings saved',
    saveFailed: 'Failed to save settings: {{message}}',
  },

  about: {
    description:
      'A lightweight desktop selection translator for reading papers, documents, and web pages.',
    version: 'Version',
    platform: 'Platform',
    features: 'Features',
    featureSelection:
      'Global shortcut translation, popup results, append selection translation, and custom API providers.',
    featureAppend:
      'Append selection helps when paper text spans pages or paragraphs and cannot be selected at once.',
    repository: 'Repository',
    openFailed: 'Failed to open link: {{message}}',
  },

  languages: {
    auto: 'Auto detect',
    'zh-CN': 'Simplified Chinese',
    en: 'English',
    ja: 'Japanese',
    ko: 'Korean',
    fr: 'French',
    de: 'German',
  },

  toast: {
    inputRequired: 'Please enter text to translate',
    noResultToCopy: 'No translation to copy',
    copied: 'Translation copied',
    translateFailed: 'Translation failed: {{message}}',
    registerShortcutFailed: 'Failed to register shortcut: {{message}}',
    selectionTranslateFailed: 'Selection translation failed: {{message}}',
  },
};

export default en;
