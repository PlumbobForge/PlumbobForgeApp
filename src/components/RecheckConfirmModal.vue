<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="recheckState.visible" style="display: flex;">
      <div class="modal modal-centered" style="max-width: 460px; width: 100%;">
        <span class="material-symbols-outlined modal-icon primary">manage_search</span>
        <h2 class="modal-title">{{ t('settings.recheck_confirm_title') }}</h2>
        <p class="modal-message" style="margin-bottom: 1.25rem;">{{ t('settings.recheck_confirm_msg') }}</p>

        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--bg-hover); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.5rem; text-align: left;">
          <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-main);">
            {{ t('settings.skip_user_tagged') }}
          </span>
          <label class="toggle-switch">
            <input type="checkbox" v-model="skipUserTagged" />
            <span class="slider round"></span>
          </label>
        </div>

        <div class="modal-actions-spaced">
          <button class="btn btn-secondary" @click="cancel">{{ t('modal.cancel') }}</button>
          <button class="btn btn-primary" @click="confirm">{{ t('modal.confirm') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';

const { recheckState } = useModal();
const { t } = useI18n();

const skipUserTagged = ref(true);

watch(() => recheckState.visible, (visible) => {
  if (visible) {
    skipUserTagged.value = recheckState.skipUserTagged ?? true;
  }
});

function cancel() {
  recheckState.visible = false;
  if (recheckState.resolve) recheckState.resolve(null);
}

function confirm() {
  recheckState.visible = false;
  if (recheckState.resolve) {
    recheckState.resolve({
      confirmed: true,
      skipUserTagged: skipUserTagged.value
    });
  }
}
</script>

<style scoped>
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-subtle);
  transition: .3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(20px);
}
</style>
