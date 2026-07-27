<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="deleteState.visible" style="display: flex;">
      <div class="modal modal-centered">
        <span class="material-symbols-outlined modal-icon danger">warning</span>
        <h2 class="modal-title">Delete Set: {{ deleteState.setName }}</h2>
        <p class="modal-text">
          Are you sure you want to delete this Set? By default, all items inside this set and its sub-sets will be moved back to 'All Items'.
        </p>
        <button class="btn btn-toggle-danger" :class="{ active: deletePhysical }" @click="deletePhysical = !deletePhysical">
          <span class="material-symbols-outlined" style="margin-right: 0.5rem;">{{ deletePhysical ? 'check_box' : 'check_box_outline_blank' }}</span>
          Permanently delete files
        </button>
        <div class="modal-actions-spaced">
          <button class="btn btn-secondary" @click="cancel">Cancel</button>
          <button class="btn btn-danger" @click="confirm">Delete</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useModal } from '@/composables/useModal';

const { deleteState } = useModal();
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
