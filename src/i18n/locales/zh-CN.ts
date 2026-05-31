const zhCN = {
  common: {
    appName: 'Aurora',
    save: '保存',
    reset: '重置',
    open: '打开',
    copy: '复制',
    close: '关闭',
    empty: '空',
  },

  sidebar: {
    translate: '翻译',
    api: 'API',
    settings: '设置',
    about: '关于',
  },

  translate: {
    title: '翻译',
    description: '输入文本并使用已配置的 API 翻译。',
    source: '原文',
    result: '译文',
    inputPlaceholder: '输入或粘贴要翻译的文本',
    resultPlaceholder: '译文会显示在这里',
    translating: '翻译中...',
    clear: '清空',
    translate: '翻译',
    characters: '{{count}} 字符',
  },

  api: {
    title: 'API 管理',
    description: '管理翻译服务、LLM 服务和调用优先级。',
    add: '新增',
    save: '保存',
    empty: '还没有 API 配置。',
    loadFailed: '加载失败：{{message}}',
    saveSuccess: '已保存',
    saveFailed: '保存失败：{{message}}',

    unnamed: '未命名 API',
    providerTypeLlm: 'LLM',
    providerTypeTranslator: '翻译',
    disabled: '已停用',
    baseUrlNotConfigured: '尚未配置 Base URL',

    expandCard: '展开卡片',
    collapseCard: '折叠卡片',
    delete: '删除',
    dragToSort: '拖动排序',

    enabled: '启用这个 API',
    name: '名称',
    type: '类型',
    llmApi: 'LLM API',
    translatorApi: '翻译 API',
    baseUrl: 'Base URL',
    model: 'Model',
    promptTemplate: 'Prompt 模板',
    promptPlaceholder: '使用 {{placeholder}} 表示待翻译文本',
    promptHelp: '使用 {{placeholder}} 作为待翻译文本占位符。',
    apiKey: 'API Key',
  },

  popup: {
    title: 'Aurora 翻译',
    waiting: '等待翻译内容',
    translating: '正在翻译...',
    copyResult: '复制译文',
    pin: '钉住窗口',
    unpin: '取消钉住',
    noResultToCopy: '没有可复制的译文',
    copied: '已复制译文',
    copyFailed: '复制失败：{{message}}',
  },

  settings: {
    title: '设置',
    selectionShortcut: '划词翻译快捷键',
    appendShortcut: '追加选区快捷键',
    recordingShortcut: '请按下新的快捷键...',
    sourceLanguage: '默认源语言',
    targetLanguage: '默认目标语言',
    showSourceText: 'Popup 显示原文',
    appLanguage: '界面语言',
    saved: '设置已保存',
    saveFailed: '保存设置失败：{{message}}',
  },

  about: {
    description: '一个专注于桌面划词翻译的轻量工具，适合阅读论文、文档和网页时快速获得译文。',
    version: '版本',
    platform: '平台',
    features: '功能',
    featureSelection: '支持全局快捷键划词翻译、弹窗结果展示、追加选区翻译和多 API 配置。',
    featureAppend: '追加选区适合处理论文跨页、跨段落时无法一次选中的文本。',
    repository: '项目地址',
    openFailed: '打开链接失败：{{message}}',
  },

  languages: {
    auto: '自动检测',
    'zh-CN': '简体中文',
    en: '英语',
    ja: '日语',
    ko: '韩语',
    fr: '法语',
    de: '德语',
  },

  toast: {
    inputRequired: '请输入要翻译的文本',
    noResultToCopy: '没有可复制的译文',
    copied: '已复制译文',
    translateFailed: '翻译失败：{{message}}',
    registerShortcutFailed: '注册快捷键失败：{{message}}',
    selectionTranslateFailed: '划词翻译失败：{{message}}',
  },
};

export default zhCN;
