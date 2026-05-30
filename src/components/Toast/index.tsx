import { useEffect, useState } from "react";
import { toast, type ToastItem } from "../../utils/toast";


function Toast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toast.subscribe(setItems);
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 grid w-[min(520px,calc(100vw-32px))] -translate-x-1/2 gap-2">
      {items.map((item) => (
        <ToastMessage key={item.id} item={item} />
      ))}
    </div>
  );
}

function ToastMessage({ item }: { item: ToastItem }) {
  const colorClass =
    item.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : item.type === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-slate-200 bg-white text-slate-700";

  return (
    <div
      className={[
        "pointer-events-auto flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm shadow-lg",
        item.leaving ? "animate-toast-out" : "animate-toast-in",
        colorClass,
      ].join(" ")}
    >
      <span className="break-words">{item.message}</span>

      <button
        type="button"
        onClick={() => toast.remove(item.id)}
        className="rounded-md px-1.5 text-current opacity-60 hover:bg-black/5 hover:opacity-100"
        aria-label="关闭提示"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;