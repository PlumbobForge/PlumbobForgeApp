<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="duplicateImportState.visible" style="display: flex;">
      <div class="modal modal-centered" style="max-width: 560px; width: 100%;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
          <span class="material-symbols-outlined modal-icon warning" style="margin: 0; font-size: 28px; color: var(--warning, #e6a23c);">warning</span>
          <h2 class="modal-title" style="margin: 0;">{{ t('modal.duplicate_title') }}</h2>
        </div>

        <p style="text-align: left; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          {{ t('modal.duplicate_desc') }}
        </p>

        <!-- Duplicate files scrollable list -->
        <div class="duplicate-file-list">
          <div v-for="(file, idx) in duplicateImportState.duplicateFiles" :key="idx" class="duplicate-file-item">
            <span class="material-symbols-outlined" style="font-size: 18px; color: var(--warning, #e6a23c);">inventory_2</span>
            <span class="duplicate-file-name">{{ file }}</span>
          </div>
        </div>

        <p style="text-align: left; font-weight: 600; font-size: 0.88rem; margin: 1rem 0 0.5rem 0;">
          {{ t('modal.duplicate_choose_action') }}
        </p>

        <!-- Option radio cards -->
        <div class="duplicate-options">
          
          <!-- Option 1: Rename (Import Anyway) -->
          <div
            class="duplicate-option-card"
            :class="{ selected: selectedAction === 'rename' }"
            @click="selectedAction = 'rename'"
          >
            <div class="duplicate-option-radio">
              <span class="material-symbols-outlined" v-if="selectedAction === 'rename'">radio_button_checked</span>
              <span class="material-symbols-outlined" v-else>radio_button_unchecked</span>
            </div>
            <div class="duplicate-option-content">
              <div class="duplicate-option-title">{{ t('modal.duplicate_action_rename') }}</div>
              <div class="duplicate-option-desc">{{ t('modal.duplicate_action_rename_desc') }}</div>
            </div>
          </div>

          <!-- Option 2: Skip -->
          <div
            class="duplicate-option-card"
            :class="{ selected: selectedAction === 'skip' }"
            @click="selectedAction = 'skip'"
          >
            <div class="duplicate-option-radio">
              <span class="material-symbols-outlined" v-if="selectedAction === 'skip'">radio_button_checked</span>
              <span class="material-symbols-outlined" v-else>radio_button_unchecked</span>
            </div>
            <div class="duplicate-option-content">
              <div class="duplicate-option-title">{{ t('modal.duplicate_action_skip') }}</div>
              <div class="duplicate-option-desc">{{ t('modal.duplicate_action_skip_desc') }}</div>
            </div>
          </div>

          <!-- Option 3: Replace -->
          <div
            class="duplicate-option-card"
            :class="{ selected: selectedAction === 'replace' }"
            @click="selectedAction = 'replace'"
          >
            <div class="duplicate-option-radio">
              <span class="material-symbols-outlined" v-if="selectedAction === 'replace'">radio_button_checked</span>
              <span class="material-symbols-outlined" v-else>radio_button_unchecked</span>
            </div>
            <div class="duplicate-option-content">
              <div class="duplicate-option-title">{{ t('modal.duplicate_action_replace') }}</div>
              <div class="duplicate-option-desc">{{ t('modal.duplicate_action_replace_desc') }}</div>
            </div>
          </div>

        </div>

        <div class="modal-actions" style="margin-top: 1.5rem; justify-content: flex-end; gap: 0.5rem;">
          <button class="btn btn-secondary" @click="cancel">{{ t('modal.cancel') }}</button>
          <button class="btn btn-primary" @click="confirm">{{ t('modal.duplicate_confirm') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';

const { duplicateImportState } = useModal();
const { t } = useI18n();

const selectedAction = ref<'rename' | 'skip' | 'replace'>('rename');

watch(() => duplicateImportState.visible, (visible) => {
  if (visible) {
    selectedAction.value = 'rename';
  }
});

function confirm() {
  if (duplicateImportState.resolve) {
    duplicateImportState.resolve(selectedAction.value);
  }
  duplicateImportState.visible = false;
}

function cancel() {
  if (duplicateImportState.resolve) {
    duplicateImportState.resolve(null);
  }
  duplicateImportState.visible = false;
}
</script>

<style scoped>
.duplicate-file-list {
  max-height: 120px;
  overflow-y: auto;
  background: var(--bg-surface, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-sm, 6px);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.duplicate-file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  word-break: break-all;
  text-align: left;
}

.duplicate-file-name {
  color: var(--text-color);
  font-family: monospace;
}

.duplicate-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.duplicate-option-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-surface, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.duplicate-option-card:hover {
  background: var(--bg-hover, rgba(255, 255, 255, 0.07));
  border-color: var(--primary-color, #409eff);
}

.duplicate-option-card.selected {
  background: rgba(64, 158, 255, 0.12);
  border-color: var(--primary-color, #409eff);
}

.duplicate-option-radio {
  display: flex;
  align-items: center;
  color: var(--primary-color, #409eff);
  margin-top: 2px;
}

.duplicate-option-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
}

.duplicate-option-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
  line-height: 1.35;
}
</style>
