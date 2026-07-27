<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="promptState.visible" style="display: flex;">
      <div class="modal modal-centered">
        <span class="material-symbols-outlined modal-icon primary">edit_square</span>
        <h2 class="modal-title">{{ promptState.title }}</h2>
        <p v-if="promptState.message" style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.9rem;">{{ promptState.message }}</p>
        <input type="text" v-model="inputValue" class="form-control modal-input-centered" @keydown.enter="submit" ref="inputEl" />
        <div class="modal-actions-spaced">
          <button class="btn btn-secondary" @click="cancel">Cancel</button>
          <button class="btn" @click="submit">Submit</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useModal } from '@/composables/useModal';

const { promptState } = useModal();
const inputValue = ref('');
const inputEl = ref<HTMLInputElement | null>(null);

watch(() => promptState.visible, async (val) => {
  if (val) {
    inputValue.value = promptState.defaultValue || '';
    await nextTick();
    inputEl.value?.focus();
    inputEl.value?.select();
  }
});

function cancel() {
  promptState.visible = false;
  if (promptState.resolve) promptState.resolve(null);
}

function submit() {
  promptState.visible = false;
  if (promptState.resolve) promptState.resolve(inputValue.value);
}
</script>
