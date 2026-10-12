import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const MAX_TOASTS = 3;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: any, type: ToastType = "info") => {
    let cleanMessage = "";
    if (typeof message === "string") {
      cleanMessage = message;
    } else if (message?.message && typeof message.message === "string") {
      cleanMessage = message.message;
    } else if (message && typeof message === "object") {
      try {
        cleanMessage = JSON.stringify(message);
      } catch {
        cleanMessage = String(message);
      }
    } else {
      cleanMessage = String(message ?? "");
    }

    if (!cleanMessage.trim()) return;

    const id = `toast-${Date.now()}-${counterRef.current++}`;

    setToasts((prev) => {
      const updated = [...prev, { id, message: cleanMessage, type }];
      // keep max 3, drop oldest
      return updated.length > MAX_TOASTS
        ? updated.slice(updated.length - MAX_TOASTS)
        : updated;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};
