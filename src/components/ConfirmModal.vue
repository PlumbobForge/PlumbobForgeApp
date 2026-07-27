<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="confirmState.visible" style="display: flex;">
      <div class="modal modal-centered">
        <span class="material-symbols-outlined modal-icon primary">help</span>
        <h2 id="confirm-title" class="modal-title">{{ confirmState.title }}</h2>
        <p id="confirm-message" class="modal-text">{{ confirmState.message }}</p>
        <div class="modal-actions-spaced">
          <button class="btn btn-secondary" @click="cancel">Cancel</button>
          <button class="btn" @click="confirm">Proceed</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useModal } from '@/composables/useModal';
const { confirmState } = useModal();

function cancel() {
  confirmState.visible = false;
  if (confirmState.resolve) confirmState.resolve(false);
}

function confirm() {
  confirmState.visible = false;
  if (confirmState.resolve) confirmState.resolve(true);
}
</script>
