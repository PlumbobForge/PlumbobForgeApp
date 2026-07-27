<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="progressState.visible" style="display: flex;">
      <div class="modal" style="width: 600px;">
        <h2>{{ progressState.title || 'Processing...' }}</h2>
        <div class="console-output" style="height: 300px; overflow-y: auto; background: #1a1a1a; color: #fff; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.85rem; margin-bottom: 1rem;" ref="logEl">
          <div v-for="(line, idx) in progressState.log" :key="idx">{{ line }}</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div style="font-weight: 600; font-variant-numeric: tabular-nums;">Time: {{ progressState.timer }}</div>
          <div :style="{ color: statusColor }">{{ progressState.status }}</div>
        </div>
        <div class="modal-actions" style="justify-content: center;">
          <button class="btn" :disabled="progressState.running" @click="close">Close</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { useModal } from '@/composables/useModal';

const { progressState } = useModal();
const logEl = ref<HTMLElement | null>(null);

watch(() => progressState.log.length, async () => {
  await nextTick();
  if (logEl.value) {
    logEl.value.scrollTop = logEl.value.scrollHeight;
  }
});

const statusColor = computed(() => {
  if (progressState.status === 'Completed') return 'var(--primary)';
  if (progressState.status === 'Failed') return '#ef4444';
  return 'var(--text-muted)';
});

function close() {
  if (!progressState.running) {
    progressState.visible = false;
  }
}
</script>
