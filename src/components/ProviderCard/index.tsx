import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ApiProvider, ApiProviderType } from '../../types/api';
import { ChevronDownIcon, DotsHandleIcon, TrashIcon } from '../icons';
import { useState } from 'react';
import { DEFAULT_TRANSLATION_PROMPT } from '../../constants/prompt';

type ProviderCardProps = {
  provider: ApiProvider;
  index: number;
  onChange: (id: string, patch: Partial<ApiProvider>) => void;
  onRemove: (id: string) => void;
};

export default function ProviderCard({ provider, index, onChange, onRemove }: ProviderCardProps) {
  const [collapsed, setCollapsed] = useState(true);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: provider.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isLlm = provider.provider_type === 'llm';

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        'rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow',
        isDragging ? 'z-10 opacity-80 shadow-lg' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold text-slate-950">
              {provider.name || '未命名 API'}
            </div>

            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              {provider.provider_type === 'llm' ? 'LLM' : '翻译'}
            </span>

            {!provider.enabled && (
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                已停用
              </span>
            )}
          </div>

          <div className="mt-1 truncate text-xs text-slate-500">
            {provider.base_url || '尚未配置 Base URL'}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed(value => !value)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={collapsed ? '展开卡片' : '折叠卡片'}
          >
            <span
              className={['transition-transform', collapsed ? '-rotate-90' : 'rotate-0'].join(' ')}
            >
              <ChevronDownIcon />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onRemove(provider.id)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="删除"
          >
            <TrashIcon />
          </button>

          <button
            type="button"
            className="flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
            aria-label="拖动排序"
            {...attributes}
            {...listeners}
          >
            <DotsHandleIcon />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={provider.enabled}
                onChange={event =>
                  onChange(provider.id, {
                    enabled: event.currentTarget.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              启用这个 API
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="名称">
              <input
                value={provider.name}
                onChange={event => onChange(provider.id, { name: event.currentTarget.value })}
                className="input"
                placeholder="OpenAI"
              />
            </Field>

            <Field label="类型">
              <div className="select-wrap">
                <select
                  value={provider.provider_type}
                  onChange={event => {
                    const providerType = event.currentTarget.value as ApiProviderType;

                    onChange(provider.id, {
                      provider_type: providerType,
                      model: providerType === 'llm' ? provider.model : '',
                      prompt_template:
                        providerType === 'llm'
                          ? provider.prompt_template || DEFAULT_TRANSLATION_PROMPT
                          : '',
                    });
                  }}
                  className="select-input"
                >
                  <option value="llm">LLM API</option>
                  <option value="translator">翻译 API</option>
                </select>
              </div>
            </Field>

            <Field label="Base URL">
              <input
                value={provider.base_url}
                onChange={event =>
                  onChange(provider.id, {
                    base_url: event.currentTarget.value,
                  })
                }
                className="input"
                placeholder="https://api.openai.com/v1"
              />
            </Field>

            {isLlm && (
              <Field label="Model">
                <input
                  value={provider.model ?? ''}
                  onChange={event =>
                    onChange(provider.id, {
                      model: event.currentTarget.value,
                    })
                  }
                  className="input"
                  placeholder="gpt-4o-mini"
                />
              </Field>
            )}

            {isLlm && (
              <div className="col-span-2">
                <Field label="Prompt 模板">
                  <textarea
                    value={provider.prompt_template ?? ''}
                    onChange={event =>
                      onChange(provider.id, {
                        prompt_template: event.currentTarget.value,
                      })
                    }
                    className="min-h-40 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    placeholder="使用 {{text}} 表示待翻译文本"
                  />
                </Field>

                <p className="mt-1 text-xs text-slate-400">
                  使用 {'{{text}}'} 作为待翻译文本占位符。
                </p>
              </div>
            )}

            <div className="col-span-2">
              <Field label="API Key">
                <input
                  type="password"
                  value={provider.api_key}
                  onChange={event =>
                    onChange(provider.id, {
                      api_key: event.currentTarget.value,
                    })
                  }
                  className="input"
                  placeholder="sk-..."
                />
              </Field>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm text-slate-600">
      <span>{label}</span>
      {children}
    </label>
  );
}
