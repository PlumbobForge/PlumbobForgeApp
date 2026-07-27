<template>
  <Teleport to="body">
    <div v-if="menuState.visible" ref="menuEl" class="context-menu" :style="{ left: menuState.x + 'px', top: menuState.y + 'px' }">
      <template v-for="(item, idx) in menuState.items" :key="idx">
        <div v-if="item.divider" class="context-menu-divider"></div>
        <div v-else class="context-menu-item" :class="{ danger: item.danger }" @click.stop="handleItemClick(item)">
          <span v-if="item.icon" class="material-symbols-outlined" style="margin-right: 0.5rem; font-size: 18px;">{{ item.icon }}</span>
          {{ item.label }}
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useContextMenu } from '@/composables/useContextMenu';
import type { ContextMenuItem } from '@/types';

const { menuState, hideContextMenu } = useContextMenu();
const menuEl = ref<HTMLElement | null>(null);

function handleItemClick(item: ContextMenuItem) {
  hideContextMenu();
  if (item.action) item.action();
}

const handleClickOutside = (e: MouseEvent) => {
  if (menuState.value.visible) {
    hideContextMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

watch(() => menuState.value.visible, async (visible) => {
  if (visible) {
    await nextTick();
    if (menuEl.value) {
      const rect = menuEl.value.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menuState.value.x = window.innerWidth - rect.width;
      }
      if (rect.bottom > window.innerHeight) {
        menuState.value.y = window.innerHeight - rect.height;
      }
    }
  }
});
</script>
