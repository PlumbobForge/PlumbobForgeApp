<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal" style="width: 550px; max-width: 90vw; padding: 2.5rem; height: auto; display: flex; flex-direction: column; justify-content: space-between; transition: 0.3s;">
      <div v-if="step === 1" style="text-align: center;">
        <img src="/logo.png" alt="PlumbobForge" draggable="false" style="height: 64px; color: var(--primary); margin-bottom: 1rem;" />
        <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">Welcome to PlumbobForge</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">Your new CC manager, designed to help you effortlessly manage custom content and more for The Sims 3</p>
      </div>
      <div v-if="step === 2" style="text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">auto_awesome</span>
        <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">What does it do?</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">PlumbobForge helps you organize, manage, and automatically merge your CC. By grouping your packages together, it can improve loading times in The Sims 3</p>
        <div class="alert alert-warning" style="background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 0.75rem; border-radius: var(--radius-sm); margin-top: 1.5rem; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 0.95rem; line-height: 1.5; text-align: left;">
          <strong>Warning:</strong> Only standard custom content (like clothes, hair, and furniture), sims, lots, and worlds should be imported. <strong>Do not import script mods</strong>, merging them will break their functionality!
        </div>
      </div>
      <div v-if="step === 3" style="text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">folder_managed</span>
        <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">Content Manager</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">This is where you organize your files into <b>Sets</b>. You can drag and drop CC, use search and filters, and browse. Sets can be nested inside one another for deeper organization</p>
      </div>
      <div v-if="step === 4" style="text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">tune</span>
        <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">Configurations</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">Configurations allow you to choose exactly which Sets are enabled or disabled for a given playthrough. You can create different Configurations for different saves, and instantly switch between them without touching your files</p>
      </div>
      <div v-if="step === 5">
        <div style="text-align: center;">
          <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">folder</span>
          <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">Game Files Directory</h2>
          <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">Please select the directory where The Sims 3 is installed. It's needed to properly handle certain files</p>
        </div>
        <div style="margin-top: 2rem;">
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-main);">The Sims 3 Installation Path</label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" v-model="gameFilesDir" class="form-control" style="flex: 1; padding: 0.75rem; font-size: 1rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); background: var(--bg-surface); color: var(--text-main);" placeholder="e.g. C:\Program Files\EA Games\The Sims 3" />
            <button class="btn btn-secondary" style="padding: 0 1rem;" @click="browseGameFilesDir">Browse</button>
          </div>
          <p v-if="validationError" style="color: var(--danger); font-size: 0.9rem; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.25rem;">
            <span class="material-symbols-outlined" style="font-size: 16px;">error</span> {{ validationError }}
          </p>
        </div>
      </div>
      <div v-if="step === 6">
        <div style="text-align: center;">
          <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">upgrade</span>
          <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">Migrate from CC Magic</h2>
          <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">Are you moving from CC Magic? PlumbobForge can automatically copy all your files into your new library.</p>
        </div>
        <div class="alert alert-warning" style="background: rgba(234, 179, 8, 0.1); color: #eab308; padding: 1rem; border-radius: var(--radius-sm); margin-top: 1.5rem; border: 1px solid rgba(234, 179, 8, 0.3); font-size: 0.95rem; line-height: 1.5;">
          <strong>Warning:</strong> This only moves your files, not your legacy Sets or Configurations. You will need to manually organize your content again in PlumbobForge.
        </div>
        <button class="btn" style="background: var(--bg-surface); color: var(--primary); border: 1px solid var(--primary); width: 100%; justify-content: center; margin-top: 1.5rem; padding: 0.75rem; font-size: 1rem;" @click="doMigrate" :disabled="migrating">
          <span class="material-symbols-outlined" style="margin-right: 0.5rem;" :class="{ spin: migrating }">{{ migrating ? 'progress_activity' : 'upgrade' }}</span>
          {{ migrating ? 'Migrating...' : 'Migrate Now' }}
        </button>
      </div>
      <div v-if="step === 7" style="text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--primary); margin-bottom: 1rem;">construction</span>
        <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">Work in Progress</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">PlumbobForge is still in early development. You may encounter bugs or missing features!</p>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6; margin-top: 1rem;">If you encounter any issues or have feedback, please reach out to me on Tumblr or Reddit.</p>
        <p style="font-size: 1.2rem; color: var(--text-main); font-weight: 600; margin-top: 1.5rem;">Thank you for downloading! - bringscookies</p>
      </div>

      <div class="modal-actions" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
        <button class="btn btn-secondary" @click="prev" :style="{ visibility: step > 1 ? 'visible' : 'hidden' }">Back</button>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <div v-for="i in 7" :key="i" style="width: 8px; height: 8px; border-radius: 50%; transition: background 0.2s;" :style="{ background: step === i ? 'var(--primary)' : 'var(--border-subtle)' }"></div>
        </div>
        <button class="btn btn-primary" @click="next" :disabled="validating">{{ step < 7 ? 'Next' : 'Finish' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { migrate, autodetectGameFiles, validateGameFiles, fetchSettings, saveSettings } from '@/api/client'
import { useToast } from '@/composables/useToast'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { showToast } = useToast()

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
      validationError.value = "Path cannot be empty."
      return
    }

    validating.value = true
    try {
      const isValid = await validateGameFiles(gameFilesDir.value)
      if (!isValid) {
        validationError.value = "Could not detect games files in this directory."
        validating.value = false
        return
      }

      const settings = await fetchSettings()
      settings.gameFilesDir = gameFilesDir.value
      await saveSettings(settings)
    } catch (err) {
      validationError.value = "An error occurred while validating."
      validating.value = false
      return
    }
    validating.value = false
  }

  if (step.value < 7) {
    step.value++
  } else {
    emit('close')
  }
}
const close = () => {
  emit('close')
}

const doMigrate = async () => {
  migrating.value = true
  try {
    const res = await migrate()
    if (res && res.copied > 0) {
      showToast(`Migrated ${res.copied} files successfully!`, 'success')
    } else {
      showToast('No files were found to migrate.', 'info')
    }
  } catch (err) {
    showToast('Migration failed. Check the logs for details.', 'error')
  } finally {
    migrating.value = false
  }
}
</script>

<style scoped>
</style>
