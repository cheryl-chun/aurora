import { useTranslation } from 'react-i18next';
import type { TokenUsage } from '../../types/translate';

function TokenUsageView({ usage }: { usage?: TokenUsage | null }) {
  const { t } = useTranslation();

  if (!usage?.totalTokens && !usage?.promptTokens && !usage?.completionTokens) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
      {usage.totalTokens !== undefined && (
        <span>{t('usage.total', { count: usage.totalTokens })}</span>
      )}
      {usage.promptTokens !== undefined && (
        <span>{t('usage.prompt', { count: usage.promptTokens })}</span>
      )}
      {usage.completionTokens !== undefined && (
        <span>{t('usage.completion', { count: usage.completionTokens })}</span>
      )}
    </div>
  );
}

export default TokenUsageView;