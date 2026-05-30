export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  leaving?: boolean;
};

type ToastListener = (items: ToastItem[]) => void;

let items: ToastItem[] = [];

const EXIT_DURATION = 180;
const listeners = new Set<ToastListener>();

function emit() {
  listeners.forEach((listener) => listener(items));
}

function createToast(
  message: string,
  type: ToastType = "info",
  duration = 2400,
) {
  const id = crypto.randomUUID();

  const item: ToastItem = {
    id,
    message,
    type,
    duration,
  };

  items = [...items, item];
  emit();

  window.setTimeout(() => {
    removeToast(id);
  }, duration);

  return id;
}

function removeToast(id: string) {
  const item = items.find((current) => current.id === id);

  if (!item || item.leaving) {
    return;
  }

  items = items.map((current) =>
    current.id === id ? { ...current, leaving: true } : current,
  );
  emit();

  window.setTimeout(() => {
    items = items.filter((current) => current.id !== id);
    emit();
  }, EXIT_DURATION);
}

function subscribe(listener: ToastListener) {
  listeners.add(listener);
  listener(items);

  return () => {
    listeners.delete(listener);
  };
}

export const toast = {
  success(message: string, duration?: number) {
    return createToast(message, "success", duration);
  },

  error(message: string, duration?: number) {
    return createToast(message, "error", duration);
  },

  info(message: string, duration?: number) {
    return createToast(message, "info", duration);
  },

  remove(id: string) {
    removeToast(id);
  },

  subscribe,
};