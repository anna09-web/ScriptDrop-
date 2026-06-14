import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  notify: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
        role="region"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => remove(toast.id)}
            className={`pointer-events-auto max-w-sm animate-fade-in rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.variant === 'success'
                ? 'border-accent/40 bg-bg-elevated text-text-primary'
                : toast.variant === 'error'
                  ? 'border-danger/50 bg-bg-elevated text-text-primary'
                  : 'border-border bg-bg-elevated text-text-primary'
            }`}
          >
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full align-middle ${
                toast.variant === 'success'
                  ? 'bg-accent'
                  : toast.variant === 'error'
                    ? 'bg-danger'
                    : 'bg-text-muted'
              }`}
            />
            {toast.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider.');
  }
  return ctx;
}
