import { ref } from 'vue';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    const id = nextId++;
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      const index = toasts.value.findIndex(t => t.id === id);
      if (index !== -1) {
        toasts.value.splice(index, 1);
      }
    }, 4000);
  }

  return { toasts, showToast };
}
