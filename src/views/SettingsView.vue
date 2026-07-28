<template>
  <div id="view-settings" class="view settings-view-container">

    <div class="settings-grid">

      <!-- Stats Box -->
      <div class="card">
        <h3 class="settings-card-title">Statistics</h3>
        <div class="settings-stats-flex">
          <div class="settings-stat-item">
            <h2 class="settings-stat-number">{{ setsCount }}</h2>
            <div class="settings-stat-label">Sets</div>
          </div>
          <div class="settings-stat-item">
            <h2 class="settings-stat-number">{{ itemsCount }}</h2>
            <div class="settings-stat-label">Items</div>
          </div>
        </div>
      </div>

      <!-- Troubleshooting Box -->
      <div class="card">
        <h3 class="settings-card-title">Troubleshooting</h3>
        <p class="settings-migrate-text">
            Something wrong? Use these options below to attempt to fix the issues you're experiencing.
        </p>
        <div class="settings-troubleshoot-flex">

          <button class="btn btn-purple-outline" id="btn-recheck-types" @click="confirmRecheckTypes">
            <span class="material-symbols-outlined icon-16-mr">analytics</span>
            Recheck Package Types
          </button>
          <button class="btn btn-success-outline" id="btn-autofix" @click="confirmAutoFix">
            <span class="material-symbols-outlined icon-16-mr">build</span>
            Attempt Auto-Fixing
          </button>
        </div>
      </div>

      <!-- Game Optimization Box -->
      <div class="card">
        <h3 class="settings-card-title">Game Optimization</h3>
        <div class="settings-form-flex">
          <div class="form-group">
            <label>Cache Compression Level</label>
            <div class="sort-trigger-wrapper" @click.stop="compressionDropdownOpen = !compressionDropdownOpen">
              <button class="btn sort-trigger" style="width: 200px; justify-content: space-between;">
                <span>{{ getCompressionLabel(settings.compressionLevel) }}</span>
                <span class="material-symbols-outlined" style="font-size:20px;">expand_more</span>
              </button>
              <div v-if="compressionDropdownOpen" class="context-menu" style="position: absolute; width: 100%; top: 100%; margin-top: 4px;">
                <div class="context-menu-item" :style="{ color: settings.compressionLevel === 0 ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCompressionLevel(0)">No compression</div>
                <div class="context-menu-item" :style="{ color: settings.compressionLevel === 1 ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCompressionLevel(1)">Low (Recommended)</div>
                <div class="context-menu-item" :style="{ color: settings.compressionLevel === 2 ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCompressionLevel(3)">Medium</div>
                <div class="context-menu-item" :style="{ color: settings.compressionLevel === 3 ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCompressionLevel(5)">High</div>
                <div class="context-menu-item" :style="{ color: settings.compressionLevel === 4 ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCompressionLevel(5)">Very High</div>
              </div>
            </div>
            <div class="form-text" style="margin-top: 0.5rem;">
              Higher compression levels may save disk space but take significantly longer to rebuild cache. Low compression provides the best balance of loading speed and fast rebuilds.
            </div>
          </div>
        </div>
      </div>

      <!-- Migration Box -->
      <div class="card">
        <h3 class="settings-card-title">Migration</h3>
        <p class="settings-migrate-text">
          Migrate your legacy CC Magic setup to PlumbobForge. This will copy all your files into your library, but not Sets or Configurations.
        </p>
        <button class="btn btn-migrate" id="btn-migrate" @click="onMigrate">
          <span class="material-symbols-outlined icon-16-mr">upgrade</span>
          Migrate from CC Magic
        </button>
      </div>

      <!-- PlumbobForge Folders Box -->
      <div class="card settings-full-width">
        <div class="settings-folder-header">
          <h3 class="m-0">Configure Folders</h3>
          <span v-if="saving" class="settings-saving-text">
             <span class="material-symbols-outlined spin icon-14">progress_activity</span>
             Saving...
          </span>
          <span v-else-if="saved" class="settings-saved-text">
             <span class="material-symbols-outlined icon-14">check</span>
             Saved
          </span>
        </div>

        <div class="settings-form-flex">
          <div class="form-group">
            <label>PlumbobForge Directory Path</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" v-model="settings.documentBaseDir" class="form-control" style="flex: 1;" @blur="onBaseDirBlur" />
              <button class="btn btn-secondary" style="padding: 0 1rem;" @click="browseDocumentBaseDir">Browse</button>
            </div>
            <div class="form-text">Location of your main PlumbobForge folder. It's where PlumbobForge will automatically manage your library.</div>
          </div>
          <div class="form-group" style="margin-top: 1rem;">
            <label>The Sims 3 Installation Path</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" v-model="settings.gameFilesDir" class="form-control" style="flex: 1;" @blur="onGameFilesDirBlur" placeholder="e.g. C:\Program Files\EA Games\The Sims 3" />
              <button class="btn btn-secondary" style="padding: 0 1rem;" @click="browseGameFilesDir">Browse</button>
            </div>
            <div class="form-text">Location of where your copy of The Sims 3 is installed. It's required to properly sync certain packages.</div>
          </div>
        </div>
      </div>

      <div class="card settings-full-width">
        <h3 class="settings-card-title">PlumbobForge Version</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1rem;">
          Current Version: <strong>{{ store.appVersion }}</strong>
        </p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <button v-if="store.updateStatus !== 'downloading' && store.updateStatus !== 'downloaded'" class="btn btn-primary" @click="checkUpdates" :disabled="store.updateStatus === 'checking'">
            <span class="material-symbols-outlined icon-16-mr" :class="{ spin: store.updateStatus === 'checking' }">sync</span>
            {{ store.updateStatus === 'checking' ? 'Checking...' : 'Check for Updates' }}
          </button>

          <button v-if="store.updateStatus === 'available'" class="btn btn-success" @click="downloadUpdate">
            <span class="material-symbols-outlined icon-16-mr">download</span>
            Download Update
          </button>

          <button v-if="store.updateStatus === 'downloaded'" class="btn btn-success" @click="installUpdate">
            <span class="material-symbols-outlined icon-16-mr">restart_alt</span>
            Install & Restart
          </button>

          <div v-if="store.updateStatus === 'downloading'" style="flex: 1; display: flex; align-items: center; gap: 1rem;">
            <div style="flex: 1; height: 8px; background: var(--bg-surface); border-radius: 4px; overflow: hidden; border: 1px solid var(--border-subtle);">
              <div :style="{ width: store.downloadPercent + '%', height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }"></div>
            </div>
            <span style="font-size: 0.9rem; color: var(--text-muted);">{{ Math.round(store.downloadPercent) }}%</span>
          </div>

          <span v-if="store.updateStatus === 'not-available'" style="color: var(--success); font-size: 0.9rem; display: flex; align-items: center; gap: 0.25rem;">
            <span class="material-symbols-outlined icon-16-mr">check_circle</span> Up to date!
          </span>

          <span v-if="store.updateStatus === 'error'" style="color: var(--danger); font-size: 0.9rem; display: flex; align-items: center; gap: 0.25rem;">
            <span class="material-symbols-outlined icon-16-mr">error</span> Failed to check for updates.
          </span>
        </div>
      </div>

      <!-- Special Thanks Box -->
      <div class="card settings-full-width" style="text-align: center;">
        <h3 class="settings-card-title" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;">
          Special Thanks <span class="material-symbols-outlined" style="color: #ef4444; font-variation-settings: 'FILL' 1;">favorite</span>
        </h3>
        <div style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6;">
          <p>Thanks to granthes for his work on <a href="https://modthesims.info/d/461888/" target="_blank" style="color: var(--primary); text-decoration: none;">CC Magic</a> and S3ToolKit.</p>
          <p>Thanks to Peter for his work on the <a href="https://s3pi.sourceforge.net/" target="_blank" style="color: var(--primary); text-decoration: none;">s3pi library</a>.</p>
          <p>Without them, PlumbobForge would've not been possible.</p>
          <p style="margin-top: 1rem;">
            <a href="https://github.com/PlumbobForge" target="_blank" style="color: var(--primary); text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.25rem;">
              <span class="material-symbols-outlined" style="font-size: 18px;">code</span> Source Code
            </a>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { fetchSettings, saveSettings as saveSettingsApi, autodetectSettings, validateGameFiles, migrate, startScan, autoFixDatabase, startRecheckTypes, fetchSets, fetchItems } from '@/api/client'
import { useModal } from '@/composables/useModal'
import { useToast } from '@/composables/useToast'
import { useAppStore } from '@/stores/app'

const { showConfirm, showProgress } = useModal()
const { showToast } = useToast()
const store = useAppStore()

const settings = ref({
  documentBaseDir: '',
  managedPackageFolderName: 'Library',
  setCacheFolderName: 'Builds',
  compressionLevel: 1,
  gameFilesDir: ''
})

let initialBaseDir = ''
let initialGameFilesDir = ''

const saving = ref(false)
const saved = ref(false)
const isInitialLoad = ref(true)

const compressionDropdownOpen = ref(false)

const closeDropdowns = () => {
  if (compressionDropdownOpen.value) compressionDropdownOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})

const getCompressionLabel = (level: number) => {
  switch (level) {
    case 0: return 'No compression'
    case 1: return 'Low (Recommended)'
    case 2: return 'Medium'
    case 3: return 'High'
    case 4: return 'Very High'
    default: return 'Low (Recommended)'
  }
}

const setCompressionLevel = (level: number) => {
  settings.value.compressionLevel = level
  compressionDropdownOpen.value = false
  onSettingsChange()
}

const setsCount = ref(0)
const itemsCount = ref(0)

const onBaseDirBlur = async () => {
  if (settings.value.documentBaseDir === initialBaseDir) return; // No change

  let moveFolder = false;
  if (initialBaseDir) {
    moveFolder = await showConfirm(
      'Move PlumbobForge Folder',
      'You changed the Document Base Directory. Do you want to move the original PlumbobForge folder and all its contents to the new location?'
    );
  }

  saving.value = true;
  saved.value = false;

  try {
    await saveSettingsApi({
      DocumentBaseDir: settings.value.documentBaseDir,
      GameFilesDir: settings.value.gameFilesDir,
      ManagedPackageFolderName: 'Library',
      SetCacheFolderName: 'Builds',
      DownloadFolderName: '',
      ArchiveFolderName: '',
      TS3PackFolderName: '',
      LegacyPackageFolderName: '',
      TS3PackStoreFolderName: '',
      CompressionLevel: settings.value.compressionLevel
    }, moveFolder)

    saving.value = false;
    saved.value = true;
    initialBaseDir = settings.value.documentBaseDir; // Update the reference point
    setTimeout(() => { saved.value = false }, 3000);
  } catch (e: any) {
    saving.value = false;
    showToast(e.message || 'Failed to save settings.', 'error');
    // Revert visually on error
    settings.value.documentBaseDir = initialBaseDir;
  }
}

const onGameFilesDirBlur = async () => {
  if (settings.value.gameFilesDir === initialGameFilesDir) return;

  if (settings.value.gameFilesDir.trim() !== '') {
    try {
      const isValid = await validateGameFiles(settings.value.gameFilesDir)
      if (!isValid) {
        const proceed = await showConfirm('Warning', 'Could not detect game files in this directory. Do you want to continue anyway?');
        if (!proceed) {
          settings.value.gameFilesDir = initialGameFilesDir;
          return;
        }
      }
    } catch (e) {
      const proceed = await showConfirm('Warning', 'An error occurred while validating this directory. Do you want to continue anyway?');
      if (!proceed) {
        settings.value.gameFilesDir = initialGameFilesDir;
        return;
      }
    }
  }

  saving.value = true;
  saved.value = false;

  try {
    await saveSettingsApi({
      DocumentBaseDir: settings.value.documentBaseDir,
      GameFilesDir: settings.value.gameFilesDir,
      ManagedPackageFolderName: 'Library',
      SetCacheFolderName: 'Builds',
      DownloadFolderName: '',
      ArchiveFolderName: '',
      TS3PackFolderName: '',
      LegacyPackageFolderName: '',
      TS3PackStoreFolderName: '',
      CompressionLevel: settings.value.compressionLevel
    }, false)

    saving.value = false;
    saved.value = true;
    initialGameFilesDir = settings.value.gameFilesDir;
    setTimeout(() => { saved.value = false }, 3000);
  } catch (e: any) {
    saving.value = false;
    showToast(e.message || 'Failed to save settings.', 'error');
    settings.value.gameFilesDir = initialGameFilesDir;
  }
}

const onSettingsChange = async () => {
  if (isInitialLoad.value) return;
  saving.value = true;
  saved.value = false;
  try {
    await saveSettingsApi({
      DocumentBaseDir: settings.value.documentBaseDir,
      GameFilesDir: settings.value.gameFilesDir,
      ManagedPackageFolderName: 'Library',
      SetCacheFolderName: 'Builds',
      DownloadFolderName: '',
      ArchiveFolderName: '',
      TS3PackFolderName: '',
      LegacyPackageFolderName: '',
      TS3PackStoreFolderName: '',
      CompressionLevel: settings.value.compressionLevel
    }, false)

    saving.value = false;
    saved.value = true;
    setTimeout(() => { saved.value = false }, 3000);
  } catch (e: any) {
    saving.value = false;
    showToast(e.message || 'Failed to save settings.', 'error');
  }
}

onMounted(async () => {
  try {
    const data = await fetchSettings()
    settings.value.documentBaseDir = data.documentBaseDir || data.DocumentBaseDir || ''
    settings.value.managedPackageFolderName = 'Library'
    settings.value.setCacheFolderName = 'Builds'
    settings.value.compressionLevel = data.compressionLevel ?? data.CompressionLevel ?? 1
    settings.value.gameFilesDir = data.gameFilesDir || data.GameFilesDir || ''
    initialBaseDir = settings.value.documentBaseDir
    initialGameFilesDir = settings.value.gameFilesDir

    // Removed autodetect block because it is now handled globally in App.vue

    const [sets, items] = await Promise.all([fetchSets(), fetchItems()])
    setsCount.value = sets.length
    itemsCount.value = items.length

    setTimeout(() => { isInitialLoad.value = false }, 500); // give it half a sec before enabling auto-save
  } catch (e) {
    showToast('Failed to load settings', 'error')
    isInitialLoad.value = false
  }
})

const onMigrate = async () => {
  if (await showConfirm(
    'Migrate from CC Magic',
    'This will copy all your Custom Content from your legacy CC Magic folder to your new PlumbobForge Library.\n\n This only migrates the files, not your Sets, Configurations, and Collections.You will need to manually organize your CC again in PlumbobForge.\n\nAre you sure you want to proceed ? '
  )) {
    try {
      const data = await migrate()
      showToast(data.message || 'Migrated successfully.', 'success')
    } catch (e: any) {
      showToast(e.message || 'Failed to migrate. Make sure backend is running.', 'error')
    }
  }
}

const confirmRunScan = async () => {
  if (await showConfirm(
    'Force Rebuild Cache',
    'Are you sure you want to force rebuild the cache? This process might take a while depending on the size and amount of CC you have, as well as your computer\'s performance.'
  )) {
    runScan()
  }
}

const runScan = async () => {
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

const confirmRecheckTypes = async () => {
  if (await showConfirm(
    'Recheck Package Types',
    'Are you sure you want to rescan all packages? This will reassign CAS, Build-Buy, etc. tags to your files. This may take a moment.'
  )) {
    runRecheckTypes()
  }
}

const runRecheckTypes = async () => {
  const progress = showProgress('Rechecking Package Types...')
  try {
    const res = await startRecheckTypes()
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
            showToast('Finished rechecking package types.', 'success')
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

const confirmAutoFix = async () => {
  if (await showConfirm(
    'Auto-Fix System',
    'Are you sure you want to run the auto-fix system? This will check for errors in the database, recover orphaned items, and force a complete cache rebuild. This process might take a while.'
  )) {
    runAutoFix()
  }
}

const runAutoFix = async () => {
  const progress = showProgress('Auto-Fixing System...')
  try {
    const res = await autoFixDatabase()
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

const browseDocumentBaseDir = async () => {
  if ((window as any).electronAPI) {
    const selectedPath = await (window as any).electronAPI.selectDirectory();
    if (selectedPath) {
      settings.value.documentBaseDir = selectedPath;
      await onBaseDirBlur();
    }
  }
}

const browseGameFilesDir = async () => {
  if ((window as any).electronAPI) {
    const selectedPath = await (window as any).electronAPI.selectDirectory();
    if (selectedPath) {
      settings.value.gameFilesDir = selectedPath;
      await onGameFilesDirBlur();
    }
  }
}

const checkUpdates = () => {
  if ((window as any).electronAPI) {
    store.updateStatus = 'checking'
    ;(window as any).electronAPI.checkForUpdates()
  }
}

const downloadUpdate = () => {
  if ((window as any).electronAPI) {
    store.updateStatus = 'downloading'
    store.downloadPercent = 0
    ;(window as any).electronAPI.downloadUpdate()
  }
}

const installUpdate = () => {
  if ((window as any).electronAPI) {
    ;(window as any).electronAPI.installUpdate()
  }
}
</script>
