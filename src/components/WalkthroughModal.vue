<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal" style="width: 550px; max-width: 90vw; padding: 2.5rem; height: auto; display: flex; flex-direction: column; justify-content: space-between; transition: 0.3s;">
      <div v-if="step === 1" style="text-align: center;">
        <img src="/logo.png" alt="PlumbobForge" draggable="false" style="height: 64px; color: var(--primary); margin-bottom: 1rem;" />
        <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">{{ t('walkthrough.welcome_title') }}</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">{{ t('walkthrough.welcome_subtitle') }}</p>
      </div>
      <div v-if="step === 2" style="text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">auto_awesome</span>
        <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">{{ t('walkthrough.what_does_it_do_title') }}</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">{{ t('walkthrough.what_does_it_do_desc') }}</p>
        <div class="alert alert-warning" style="background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 0.75rem; border-radius: var(--radius-sm); margin-top: 1.5rem; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 0.95rem; line-height: 1.5; text-align: left;" v-html="t('walkthrough.script_mods_warning')">
        </div>
      </div>
      <div v-if="step === 3" style="text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">folder_managed</span>
        <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">{{ t('walkthrough.content_manager_title') }}</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;" v-html="t('walkthrough.content_manager_desc')"></p>
      </div>
      <div v-if="step === 4" style="text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">tune</span>
        <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">{{ t('walkthrough.configurations_title') }}</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">{{ t('walkthrough.configurations_desc') }}</p>
      </div>
      <div v-if="step === 5">
        <div style="text-align: center;">
          <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">folder</span>
          <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">{{ t('walkthrough.game_dir_title') }}</h2>
          <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">{{ t('walkthrough.game_dir_desc') }}</p>
        </div>
        <div style="margin-top: 2rem;">
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-main);">{{ t('walkthrough.game_dir_label') }}</label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" v-model="gameFilesDir" class="form-control" style="flex: 1; padding: 0.75rem; font-size: 1rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); background: var(--bg-surface); color: var(--text-main);" :placeholder="t('walkthrough.game_dir_placeholder')" />
            <button class="btn btn-secondary" style="padding: 0 1rem;" @click="browseGameFilesDir">{{ t('walkthrough.browse') }}</button>
          </div>
          <div v-if="validationError" style="margin-top: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
            <p style="color: var(--danger); font-size: 0.9rem; margin: 0; display: flex; align-items: center; gap: 0.25rem;">
              <span class="material-symbols-outlined" style="font-size: 16px;">error</span> {{ validationError }}
            </p>
            <button @click="forceNext" class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.85rem;">{{ t('walkthrough.continue_anyway') }}</button>
          </div>
        </div>
      </div>
      <div v-if="step === 6">
        <div style="text-align: center;">
          <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">upgrade</span>
          <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">{{ t('walkthrough.migrate_title') }}</h2>
          <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">{{ t('walkthrough.migrate_desc') }}</p>
        </div>
        <div class="alert alert-warning" style="background: rgba(234, 179, 8, 0.1); color: #eab308; padding: 1rem; border-radius: var(--radius-sm); margin-top: 1.5rem; border: 1px solid rgba(234, 179, 8, 0.3); font-size: 0.95rem; line-height: 1.5;">
          {{ t('walkthrough.migrate_warning') }}
        </div>
        <button class="btn" style="background: var(--bg-surface); color: var(--primary); border: 1px solid var(--primary); width: 100%; justify-content: center; margin-top: 1.5rem; padding: 0.75rem; font-size: 1rem;" @click="doMigrate" :disabled="migrating">
          <span class="material-symbols-outlined" style="margin-right: 0.5rem;" :class="{ spin: migrating }">{{ migrating ? 'progress_activity' : 'upgrade' }}</span>
          {{ migrating ? t('walkthrough.migrating_btn') : t('walkthrough.migrate_btn') }}
        </button>
      </div>
      <div v-if="step === 7" style="text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">construction</span>
        <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">{{ t('walkthrough.wip_title') }}</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">{{ t('walkthrough.wip_desc1') }}</p>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6; margin-top: 1rem;">{{ t('walkthrough.wip_desc2') }}</p>
        <p style="font-size: 1.2rem; color: var(--text-main); font-weight: 600; margin-top: 1.5rem;">{{ t('walkthrough.wip_thankyou') }}</p>
      </div>

      <div class="modal-actions" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
        <button class="btn btn-secondary" @click="prev" :style="{ visibility: step > 1 ? 'visible' : 'hidden' }">{{ t('walkthrough.back') }}</button>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <div v-for="i in 7" :key="i" style="width: 8px; height: 8px; border-radius: 50%; transition: background 0.2s;" :style="{ background: step === i ? 'var(--primary)' : 'var(--border-subtle)' }"></div>
        </div>
        <button class="btn btn-primary" @click="next" :disabled="validating">{{ step < 7 ? t('walkthrough.next') : t('walkthrough.finish') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { migrate, autodetectGameFiles, validateGameFiles, fetchSettings, saveSettings } from '@/api/client'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { showToast } = useToast()
const { t } = useI18n()

const step = ref(1)
const migrating = ref(false)

const gameFilesDir = ref('')
const validationError = ref('')
const validating = ref(false)

onMounted(async () => {
  try {
    const settings = await fetchSettings()
    if (settings.gameFilesDir) {
      gameFilesDir.value = settings.gameFilesDir
    } else {
      const autoPath = await autodetectGameFiles()
      if (autoPath) {
        gameFilesDir.value = autoPath
      }
    }
  } catch (err) {
    console.error('Failed to fetch/autodetect settings for walkthrough', err)
  }
})

// Clear error on type
watch(gameFilesDir, () => {
  validationError.value = ''
})

const prev = () => {
  if (step.value > 1) step.value--
}

const browseGameFilesDir = async () => {
  if ((window as any).electronAPI) {
    const selectedPath = await (window as any).electronAPI.selectDirectory();
    if (selectedPath) {
      gameFilesDir.value = selectedPath;
      validationError.value = "";
    }
  }
}

const next = async () => {
  if (step.value === 5) {
    if (!gameFilesDir.value.trim()) {
      validationError.value = t('walkthrough.path_empty_error')
      return
    }

    validating.value = true
    try {
      const res = await validateGameFiles(gameFilesDir.value)
      if (!res.valid) {
        validationError.value = t('walkthrough.game_dir_invalid_error')
        validating.value = false
        return
      }

      if (res.normalizedPath) {
        gameFilesDir.value = res.normalizedPath
      }

      const settings = await fetchSettings()
      settings.gameFilesDir = gameFilesDir.value
      await saveSettings(settings)
    } catch (err) {
      validationError.value = t('walkthrough.validation_error')
      validating.value = false
      return
    }
    validating.value = false
  }

  if (step.value < 7) {
    step.value++
  } else {
    localStorage.setItem('plumbobforge_has_seen_walkthrough', 'true')
    emit('close')
  }
}

const forceNext = async () => {
  validating.value = true
  try {
    const settings = await fetchSettings()
    settings.gameFilesDir = gameFilesDir.value
    await saveSettings(settings)
  } catch (err) {
    console.error(err)
  }
  validating.value = false
  validationError.value = ""
  step.value++
}

const close = () => {
  localStorage.setItem('plumbobforge_has_seen_walkthrough', 'true')
  emit('close')
}

const doMigrate = async () => {
  migrating.value = true
  try {
    const res = await migrate()
    if (res && res.copied > 0) {
      showToast(t('settings.migrate_success', { count: res.copied }), 'success')
    } else {
      showToast(t('settings.migrate_no_files'), 'info')
    }
  } catch (err: any) {
    showToast(err.message || t('settings.migrate_error'), 'error')
  } finally {
    migrating.value = false
  }
}
</script>

<style scoped>
</style>
