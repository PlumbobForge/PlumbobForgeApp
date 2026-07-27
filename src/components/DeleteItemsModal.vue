<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="deleteItemsState.visible" style="display: flex;">
      <div class="modal modal-centered">
        <span class="material-symbols-outlined modal-icon danger">warning</span>
        <h2 class="modal-title">Delete Items</h2>
        <p class="modal-text">
          {{ deleteItemsState.message }}
        </p>
        <button class="btn btn-toggle-danger" :class="{ active: permanent }" @click="permanent = !permanent">
          <span class="material-symbols-outlined">{{ permanent ? 'check_box' : 'check_box_outline_blank' }}</span>
          Delete permanently (do not move to Recycle Bin)
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

const { deleteItemsState } = useModal();
const permanent = ref(false);

watch(() => deleteItemsState.visible, (val) => {
  if (val) permanent.value = false;
});

function cancel() {
  deleteItemsState.visible = false;
  if (deleteItemsState.resolve) deleteItemsState.resolve(null);
}

function confirm() {
  deleteItemsState.visible = false;
  if (deleteItemsState.resolve) deleteItemsState.resolve({ confirmed: true, permanent: permanent.value });
}
</script>
