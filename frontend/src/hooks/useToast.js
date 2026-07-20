import { useUIStore } from '../store/uiStore';

export function useToast() {
  const { addToast, removeToast } = useUIStore();

  return {
    success: (message, duration) => addToast({ message, type: 'success', duration }),
    error:   (message, duration) => addToast({ message, type: 'error',   duration }),
    info:    (message, duration) => addToast({ message, type: 'info',    duration }),
    warning: (message, duration) => addToast({ message, type: 'warning', duration }),
    dismiss: removeToast,
  };
}
