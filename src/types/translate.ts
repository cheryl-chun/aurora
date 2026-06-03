export type TokenUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type TranslateResponse = {
  content: string;
  usage?: TokenUsage | null;
};