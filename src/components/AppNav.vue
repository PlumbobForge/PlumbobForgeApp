<template>
  <div class="top-menu">
    <div class="custom-tooltip-container" data-tooltip="PlumbobForge">
      <img src="/logo.png" alt="PlumbobForge" draggable="false" style="height: 33px; object-fit: contain; cursor: help; app-region: no-drag;" />
    </div>
    <nav class="nav">
      <router-link to="/" class="nav-item" draggable="false" exact-active-class="active">
        <span class="material-symbols-outlined" style="font-size: 20px;">folder</span>
        {{ t('nav.content_manager') }}
      </router-link>
      <router-link to="/configurations" class="nav-item" draggable="false" active-class="active">
        <span class="material-symbols-outlined" style="font-size: 20px;">tune</span>
        {{ t('nav.configurations') }}
      </router-link>
      <router-link to="/settings" class="nav-item" draggable="false" active-class="active">
        <span class="material-symbols-outlined" style="font-size: 20px;">settings</span>
        {{ t('nav.settings') }}
      </router-link>
    </nav>
    <div class="d-flex flex-center gap-4 ml-auto" style="-webkit-app-region: no-drag;">
      <button v-if="store.isDirty" id="dirty-warning" @click="$emit('rebuild')" class="btn dirty-warning">
        <span class="material-symbols-outlined" style="margin-right: 0.5rem; font-size: 20px;">warning</span>
        {{ t('nav.rebuild_cache') }}
      </button>
    </div>

    <div class="window-controls" style="-webkit-app-region: no-drag;">
      <button class="window-control-btn" @click="minimizeWindow">
        <span class="material-symbols-outlined">remove</span>
      </button>
      <button class="window-control-btn" @click="maximizeWindow">
        <span class="material-symbols-outlined">crop_square</span>
      </button>
      <button class="window-control-btn close-btn" @click="closeWindow">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import { useRouter } from 'vue-router';
import { useI18n } from '@/composables/useI18n';

import { useModal } from '@/composables/useModal';

const store = useAppStore();
const router = useRouter();
const { t } = useI18n();
const { showConfirm } = useModal();

defineEmits<{
  (e: 'rebuild'): void
}>();

const minimizeWindow = () => {
  if ((window as any).electronAPI) (window as any).electronAPI.minimize();
}

const maximizeWindow = () => {
  if ((window as any).electronAPI) (window as any).electronAPI.maximize();
}

const closeWindow = async () => {
  if (store.isDirty) {
    const confirmed = await showConfirm(
      t('modal.close_warning_title'),
      t('modal.close_warning_msg'),
      {
        confirmText: t('modal.close_anyway'),
        danger: true
      }
    );
    if (!confirmed) return;
  }
  if ((window as any).electronAPI) (window as any).electronAPI.close();
}
</script>

<style scoped>
.top-menu {
  -webkit-app-region: drag;
  padding-right: 0;
}

.window-controls {
  display: flex;
}

.window-control-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  width: 46px;
  height: 64px; /* match top-menu height or fill available space */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.window-control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
}

.window-control-btn.close-btn:hover {
  background: #e81123;
  color: #fff;
}
</style>
