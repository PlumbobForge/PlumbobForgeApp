<template>
  <template v-if="appReady">
    <AppNav @rebuild="handleRebuild" @import="handleImport" />
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </template>
  <ToastContainer />
  <ContextMenu />
  <ConfirmModal />
  <PromptModal />
  <DeleteSetModal />
  <DeleteItemsModal />
  <SelectSetModal />
  <ProgressModal />
  <WalkthroughModal :visible="showWalkthrough" @close="closeWalkthrough" />
</template>

<script setup lang="ts">
import { useModal } from '@/composables/useModal'
import { useToast } from '@/composables/useToast'
import { startScan, importDownloads, fetchSets, fetchSettings, validateGameFiles, autodetectSettings, saveSettings as saveSettingsApi } from '@/api/client'
import { useAppStore } from '@/stores/app'
import { onMounted } from 'vue'
import AppNav from '@/components/AppNav.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import PromptModal from '@/components/PromptModal.vue'
import DeleteSetModal from '@/components/DeleteSetModal.vue'
import DeleteItemsModal from '@/components/DeleteItemsModal.vue'
import SelectSetModal from '@/components/SelectSetModal.vue'
import ProgressModal from '@/components/ProgressModal.vue'
import WalkthroughModal from '@/components/WalkthroughModal.vue'
import { ref } from 'vue'

const store = useAppStore()
const { showProgress } = useModal()
const { showToast } = useToast()

const showWalkthrough = ref(false)
const appReady = ref(false)

const initializeDirtyState = async () => {
  try {
    const sets = await fetchSets()
    store.isDirty = sets.some(s => s.dirty)
  } catch (err) {
    console.error('Failed to initialize dirty state:', err)
  }
}

const closeWalkthrough = async () => {
  showWalkthrough.value = false
  try {
    const settings = await fetchSettings()
    settings.hasSeenWalkthrough = true
    settings.HasSeenWalkthrough = true
    await saveSettingsApi(settings, false)
  } catch (e) {
    console.error('Failed to save walkthrough state', e)
  }
  appReady.value = true
  initializeDirtyState()
}

onMounted(async () => {
  if ((window as any).electronAPI) {
    store.appVersion = await (window as any).electronAPI.getAppVersion()
    
    ;(window as any).electronAPI.onUpdateEvent('update-available', () => {
      store.updateStatus = 'available'
      showToast('An update is available! Check the settings to download it.', 'info')
    })
    ;(window as any).electronAPI.onUpdateEvent('update-not-available', () => {
      store.updateStatus = 'not-available'
      setTimeout(() => store.updateStatus = 'idle', 5000)
    })
    ;(window as any).electronAPI.onUpdateEvent('update-error', (err: string) => {
      store.updateStatus = 'error'
      console.error('Update error:', err)
      setTimeout(() => store.updateStatus = 'idle', 5000)
    })
    ;(window as any).electronAPI.onUpdateEvent('download-progress', (progressObj: any) => {
      store.updateStatus = 'downloading'
      store.downloadPercent = progressObj.percent
    })
    ;(window as any).electronAPI.onUpdateEvent('update-downloaded', () => {
      store.updateStatus = 'downloaded'
      showToast('Update downloaded! You can now install it from settings.', 'success')
    })

    // Check for updates silently on startup
    ;(window as any).electronAPI.checkForUpdates()
  }

  try {
    const settings = await fetchSettings()
    
    if (!settings.hasSeenWalkthrough && !settings.HasSeenWalkthrough) {
      showWalkthrough.value = true
    } else {
      let currentDocDir = settings.documentBaseDir || settings.DocumentBaseDir || ''
      let currentGameFilesDir = settings.gameFilesDir || settings.GameFilesDir || ''

      // Auto-detect if empty
      if (!currentDocDir) {
        try {
          const adData = await autodetectSettings()
          currentDocDir = adData.documentBaseDir || adData.DocumentBaseDir || ''
          currentGameFilesDir = adData.gameFilesDir || adData.GameFilesDir || ''

          // Auto-save the detected path
          await saveSettingsApi({
            DocumentBaseDir: currentDocDir,
            GameFilesDir: currentGameFilesDir,
            ManagedPackageFolderName: 'Library',
            SetCacheFolderName: 'Builds',
            DownloadFolderName: '',
            ArchiveFolderName: '',
            TS3PackFolderName: '',
            LegacyPackageFolderName: '',
            TS3PackStoreFolderName: '',
            CompressionLevel: settings.compressionLevel ?? settings.CompressionLevel ?? 1,
            HasSeenWalkthrough: true
          }, false)
        } catch (e) {
          console.error('Failed to auto-detect and save settings', e)
        }
      }

      appReady.value = true
      initializeDirtyState()
    }
  } catch (err) {
    console.error('Failed to initialize app', err)
    showWalkthrough.value = true
  }
})

const handleRebuild = async () => {
  const progress = showProgress('Rebuilding Cache...')
  try {
    const res = await startScan()
    const reader = res.body?.getReader()
    if (!reader) throw new Error('No reader available')

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value)
      const lines = text.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const msg = line.substring(6).trim()
          if (msg === 'DONE') {
            progress.finish(true)
            store.isDirty = false
            return
          }
          progress.appendLog(msg)
        }
      }
    }
  } catch (err) {
    progress.appendLog('Error: ' + err)
    progress.finish(false)
  }
}

const handleImport = async () => {
  const progress = showProgress('Importing from Downloads...')
  try {
    const res = await importDownloads()
    const reader = res.body?.getReader()
    if (!reader) throw new Error('No reader available')

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value)
      const lines = text.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const msg = line.substring(6).trim()
          if (msg === 'DONE') {
            progress.finish(true)
            // Reload the page to refresh all content
            window.location.reload()
            return
          }
          progress.appendLog(msg)
        }
      }
    }
  } catch (err) {
    progress.appendLog('Error: ' + err)
    progress.finish(false)
  }
}
</script>
