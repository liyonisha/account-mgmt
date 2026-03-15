import { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const showToast = useCallback((type, message, duration = 4000) => {
    setToast({ type, message, duration });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex justify-end px-4">
          <div
            className={`pointer-events-auto max-w-md rounded-lg px-4 py-3 text-sm shadow-lg ring-1 ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                : "bg-red-50 text-red-900 ring-red-200"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

