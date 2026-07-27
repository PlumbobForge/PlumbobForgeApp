import { ref } from 'vue';
import type { ContextMenuItem } from '@/types';

const menuState = ref<{
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}>({
  visible: false,
  x: 0,
  y: 0,
  items: []
});

export function useContextMenu() {
  function showContextMenu(x: number, y: number, items: ContextMenuItem[]) {
    menuState.value = { visible: true, x, y, items };
  }

  function hideContextMenu() {
    menuState.value.visible = false;
  }

  return { menuState, showContextMenu, hideContextMenu };
}
