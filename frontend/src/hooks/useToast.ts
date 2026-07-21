import { useState, useCallback } from 'react';

export interface ToastItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  district?: string;
  reportId?: string;
}

let toastListeners: Array<(toasts: ToastItem[]) => void> = [];
let memoryToasts: ToastItem[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...memoryToasts]));
}

export function showToast(toast: Omit<ToastItem, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9);
  const newItem: ToastItem = { ...toast, id };
  memoryToasts = [newItem, ...memoryToasts.slice(0, 4)];
  notifyListeners();

  setTimeout(() => {
    memoryToasts = memoryToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, 5000);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(memoryToasts);

  const removeToast = useCallback((id: string) => {
    memoryToasts = memoryToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  return { toasts, removeToast, showToast };
}
