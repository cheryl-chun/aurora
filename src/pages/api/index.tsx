import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { ApiProvider } from "../../types/api";
import ProviderCard from "../../components/ProviderCard";
import { PlusIcon, SaveIcon } from "../../components/icons";
import { DEFAULT_TRANSLATION_PROMPT } from "../../constants/prompt";
import { toast } from "../../utils/toast";

function ApiPage() {
  const [providers, setProviders] = useState<ApiProvider[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    try {
      const data = await invoke<ApiProvider[]>("load_api_providers");
      setProviders(data.sort((a, b) => a.priority - b.priority));
    } catch (error) {
      toast.error(`加载失败：${String(error)}`);
    }
  }

  async function saveProviders() {
    const normalized = providers.map((provider, index) => ({
      ...provider,
      priority: index,
    }));

    try {
      await invoke("save_api_providers", {
        apiProviders: normalized,
      });

      setProviders(normalized);
      toast.success("已保存");
    } catch (error) {
      toast.error(`保存失败：${String(error)}`);
    }
  }

  function addProvider() {
    setProviders((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        provider_type: "llm",
        base_url: "",
        api_key: "",
        model: "",
        prompt_template: DEFAULT_TRANSLATION_PROMPT,
        enabled: true,
        priority: current.length,
      },
    ]);
  }

  function updateProvider(id: string, patch: Partial<ApiProvider>) {
    setProviders((current) =>
      current.map((provider) =>
        provider.id === id ? { ...provider, ...patch } : provider
      )
    );
  }

  function removeProvider(id: string) {
    setProviders((current) => current.filter((provider) => provider.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setProviders((current) => {
      const oldIndex = current.findIndex((provider) => provider.id === active.id);
      const newIndex = current.findIndex((provider) => provider.id === over.id);

      return arrayMove(current, oldIndex, newIndex);
    });
  }

  return (
    <div className="min-h-full bg-slate-50 px-8 py-7 text-slate-950">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">API 管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            管理翻译服务、LLM 服务和调用优先级。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addProvider}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
          >
            <PlusIcon />
            新增
          </button>

          <button
            onClick={saveProviders}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            <SaveIcon />
            保存
          </button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={providers.map((provider) => provider.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-3">
            {providers.map((provider, index) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                index={index}
                onChange={updateProvider}
                onRemove={removeProvider}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {providers.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          还没有 API 配置。
        </div>
      )}
    </div>
  );
}

export default ApiPage;