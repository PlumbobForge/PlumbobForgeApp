<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="userTagsState.visible" style="display: flex;">
      <div class="modal modal-centered" style="max-width: 520px; width: 100%;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
          <span class="material-symbols-outlined modal-icon primary" style="margin: 0; font-size: 28px;">sell</span>
          <h2 class="modal-title" style="margin: 0;">{{ t('modal.tags_title') }}</h2>
        </div>

        <p style="text-align: left; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem;">
          {{ t('modal.tags_instruction') }}
        </p>

        <div v-if="userTagsState.hasDifferentTags" style="text-align: left; font-size: 0.85rem; color: var(--warning, #e6a23c); margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: rgba(230,162,60,0.1); border-radius: var(--radius-sm); border: 1px solid rgba(230,162,60,0.2);">
          {{ t('modal.tags_different_warning') }}
        </div>

        <div class="tags-input-container" @click="focusInput">
          <div
            v-for="(tag, index) in tagsList"
            :key="index"
            class="tag-input-pill"
          >
            <span>{{ tag }}</span>
            <button type="button" class="tag-pill-remove" @click.stop="removeTag(index)">
              <span class="material-symbols-outlined" style="font-size: 14px;">close</span>
            </button>
          </div>
          <input
            ref="inputRef"
            type="text"
            class="tag-input-field"
            v-model="inputValue"
            @keydown="onKeyDown"
            @blur="addCurrentInput"
            :placeholder="tagsList.length === 0 ? 'Type tag and press Enter...' : ''"
          />
        </div>

        <div class="modal-actions-spaced" style="margin-top: 1.5rem; justify-content: space-between;">
          <button class="btn btn-danger-outline" @click="removeAll">
            {{ t('modal.remove_all') }}
          </button>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" @click="cancel">{{ t('modal.cancel') }}</button>
            <button class="btn btn-primary" @click="confirm">{{ t('modal.save') }}</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';

const { userTagsState } = useModal();
const { t } = useI18n();

const tagsList = ref<string[]>([]);
const inputValue = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

watch(() => userTagsState.visible, (visible) => {
  if (visible) {
    tagsList.value = userTagsState.hasDifferentTags ? [] : [...userTagsState.initialTags];
    inputValue.value = '';
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

function focusInput() {
  inputRef.value?.focus();
}

function addCurrentInput() {
  const val = inputValue.value.trim().replace(/,/g, '');
  if (val && !tagsList.value.some(t => t.toLowerCase() === val.toLowerCase())) {
    tagsList.value.push(val);
  }
  inputValue.value = '';
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addCurrentInput();
  } else if (e.key === 'Backspace' && inputValue.value === '' && tagsList.value.length > 0) {
    tagsList.value.pop();
  }
}

function removeTag(index: number) {
  tagsList.value.splice(index, 1);
}

function removeAll() {
  tagsList.value = [];
  inputValue.value = '';
  if (userTagsState.hasDifferentTags) {
    // If different tags mode, removeAll directly calls resolve with removeAll: true
    userTagsState.visible = false;
    if (userTagsState.resolve) {
      userTagsState.resolve({
        confirmed: true,
        removeAll: true
      });
    }
  }
}

function cancel() {
  userTagsState.visible = false;
  if (userTagsState.resolve) userTagsState.resolve(null);
}

function confirm() {
  addCurrentInput();
  userTagsState.visible = false;
  if (userTagsState.resolve) {
    if (userTagsState.hasDifferentTags) {
      userTagsState.resolve({
        confirmed: true,
        addTags: tagsList.value
      });
    } else {
      userTagsState.resolve({
        confirmed: true,
        setTags: tagsList.value
      });
    }
  }
}
</script>

<style scoped>
.tags-input-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  min-height: 90px;
  max-height: 200px;
  overflow-y: auto;
  cursor: text;
  transition: border-color 0.2s ease;
}

.tags-input-container:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb, 99, 102, 241), 0.15);
}

.tag-input-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  background: var(--bg-hover, rgba(255, 255, 255, 0.08));
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-main);
}

.tag-pill-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  transition: color 0.15s ease;
}

.tag-pill-remove:hover {
  color: var(--danger, #ff4d4f);
}

.tag-input-field {
  flex: 1;
  min-width: 120px;
  border: none;
  background: transparent;
  outline: none;
  color: var(--text-main);
  font-size: 0.9rem;
  padding: 0.25rem 0;
}
</style>
