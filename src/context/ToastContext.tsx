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

const MAX_VISIBLE_TOASTS = 2;

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

    cleanMessage = cleanMessage.trim();
    if (!cleanMessage) return;

    setToasts((prev) => {
      // Prevent spamming if the exact same message is already visible
      if (prev.some((t) => t.message === cleanMessage)) {
        return prev;
      }

      const id = `toast-${Date.now()}-${counterRef.current++}`;
      const updated = [...prev, { id, message: cleanMessage, type }];

      // Standard mobile UX: keep max 2 at the top so the screen/header isn't cluttered
      return updated.length > MAX_VISIBLE_TOASTS
        ? updated.slice(updated.length - MAX_VISIBLE_TOASTS)
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
