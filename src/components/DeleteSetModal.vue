<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="deleteState.visible" style="display: flex;">
      <div class="modal modal-centered">
        <span class="material-symbols-outlined modal-icon danger">warning</span>
        <h2 class="modal-title">{{ t('modal.delete_set_title') }}: {{ deleteState.setName }}</h2>
        <p class="modal-text">
          {{ t('modal.delete_set_msg', { name: deleteState.setName }) }}
        </p>
        <button class="btn btn-toggle-danger" :class="{ active: deletePhysical }" @click="deletePhysical = !deletePhysical">
          <span class="material-symbols-outlined" style="margin-right: 0.5rem;">{{ deletePhysical ? 'check_box' : 'check_box_outline_blank' }}</span>
          {{ t('modal.delete_set_delete_items') }}
        </button>
        <div class="modal-actions-spaced">
          <button class="btn btn-secondary" @click="cancel">{{ t('modal.cancel') }}</button>
          <button class="btn btn-danger" @click="confirm">{{ t('modal.delete') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';

const { deleteState } = useModal();
const { t } = useI18n();
const deletePhysical = ref(false);

watch(() => deleteState.visible, (val) => {
  if (val) deletePhysical.value = false;
});

function cancel() {
  deleteState.visible = false;
  if (deleteState.resolve) deleteState.resolve(null);
}

function confirm() {
  deleteState.visible = false;
  if (deleteState.resolve) deleteState.resolve({ confirmed: true, deletePhysical: deletePhysical.value });
}
</script>
