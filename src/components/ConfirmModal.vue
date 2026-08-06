<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="confirmState.visible" style="display: flex;">
      <div class="modal modal-centered">
        <span class="material-symbols-outlined modal-icon" :class="confirmState.danger ? 'warning' : 'primary'" :style="confirmState.danger ? 'color: var(--danger, #f56c6c);' : ''">{{ confirmState.danger ? 'warning' : 'help' }}</span>
        <h2 id="confirm-title" class="modal-title">{{ confirmState.title }}</h2>
        <p id="confirm-message" class="modal-text">{{ confirmState.message }}</p>
        <div class="modal-actions-spaced">
          <button class="btn btn-secondary" @click="cancel">{{ confirmState.cancelText || t('modal.cancel') }}</button>
          <button class="btn" :class="confirmState.danger ? 'btn-danger' : 'btn-primary'" @click="confirm">{{ confirmState.confirmText || t('modal.confirm') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';

const { confirmState } = useModal();
const { t } = useI18n();

function cancel() {
  confirmState.visible = false;
  if (confirmState.resolve) confirmState.resolve(false);
}

function confirm() {
  confirmState.visible = false;
  if (confirmState.resolve) confirmState.resolve(true);
}
</script>
