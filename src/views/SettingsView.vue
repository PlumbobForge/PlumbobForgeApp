<template>
  <div id="view-settings" class="view settings-view-container">

    <!-- Version & Updates Hero Card -->
    <div class="card settings-update-hero">
      <div class="update-hero-left">
        <div class="update-hero-icon-bg">
          <span class="material-symbols-outlined update-hero-icon">rocket_launch</span>
        </div>
        <div class="update-hero-info">
          <div class="update-hero-version-row">
            <span class="update-hero-title">{{ t('settings.version') }}</span>
            <span class="badge update-version-badge">v{{ store.appVersion }}</span>
          </div>
          
          <!-- Status Indicators -->
          <div class="update-hero-status-text">
            <span v-if="store.updateStatus === 'checking'" class="status-checking">
              <span class="material-symbols-outlined spin icon-14">sync</span> {{ t('settings.checking_updates') }}
            </span>
            <span v-else-if="store.updateStatus === 'not-available'" class="status-up-to-date">
              <span class="material-symbols-outlined icon-14">check_circle</span> {{ t('settings.up_to_date') }}
            </span>
            <span v-else-if="store.updateStatus === 'available'" class="status-available">
              <span class="material-symbols-outlined icon-14">new_releases</span> {{ t('settings.update_available') }}
            </span>
            <span v-else-if="store.updateStatus === 'downloading'" class="status-downloading">
              <span class="material-symbols-outlined spin icon-14">downloading</span> {{ t('settings.downloading_update', { percent: Math.round(store.downloadPercent) }) }}
            </span>
            <span v-else-if="store.updateStatus === 'downloaded'" class="status-downloaded">
              <span class="material-symbols-outlined icon-14">verified</span> {{ t('settings.update_ready') }}
            </span>
            <span v-else-if="store.updateStatus === 'error'" class="status-error">
              <span class="material-symbols-outlined icon-14">error</span> {{ t('settings.update_error') }}
            </span>
            <span v-else class="status-idle">
              {{ t('settings.latest_installed') }}
            </span>
          </div>

          <!-- Download Progress Bar -->
          <div v-if="store.updateStatus === 'downloading'" class="update-progress-bar-bg">
            <div class="update-progress-bar-fill" :style="{ width: store.downloadPercent + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="update-hero-actions">
        <button v-if="store.updateStatus !== 'downloading' && store.updateStatus !== 'downloaded'" class="btn btn-primary" @click="checkUpdates" :disabled="store.updateStatus === 'checking'">
          <span class="material-symbols-outlined icon-16-mr" :class="{ spin: store.updateStatus === 'checking' }">sync</span>
          {{ store.updateStatus === 'checking' ? t('settings.checking_updates') : t('settings.check_updates') }}
        </button>

        <button v-if="store.updateStatus === 'available'" class="btn btn-success" @click="downloadUpdate">
          <span class="material-symbols-outlined icon-16-mr">download</span>
          {{ t('settings.download_update') }}
        </button>

        <button v-if="store.updateStatus === 'downloaded'" class="btn btn-success" @click="installUpdate">
          <span class="material-symbols-outlined icon-16-mr">restart_alt</span>
          {{ t('settings.install_restart') }}
        </button>

        <button class="btn btn-secondary" @click="openChangelog">
          <span class="material-symbols-outlined icon-16-mr">rocket_launch</span>
          {{ t('settings.view_changelog') }}
        </button>
      </div>
    </div>

    <!-- 2-Column Responsive Layout -->
    <div class="settings-2col-layout">

      <!-- LEFT COLUMN: Preferences & Optimization -->
      <div class="settings-col">
        
        <!-- Appearance & Preferences -->
        <div class="card">
          <h3 class="settings-card-title">
            <span class="material-symbols-outlined title-icon">tune</span>
            {{ t('settings.preferences_appearance') }}
          </h3>

          <div class="settings-form-row">
            <!-- Language -->
            <div class="form-group flex-1">
              <label>{{ t('settings.language') }}</label>
              <div class="sort-trigger-wrapper" @click.stop="languageDropdownOpen = !languageDropdownOpen">
                <button class="btn sort-trigger" style="width: 100%; justify-content: space-between;">
                  <span>{{ getLanguageLabel(settings.language) }}</span>
                  <span class="material-symbols-outlined" style="font-size:20px;">expand_more</span>
                </button>
                <div v-if="languageDropdownOpen" class="context-menu" style="position: absolute; width: 100%; top: 100%; margin-top: 4px; z-index: 100;">
                  <div class="context-menu-item" :style="{ color: settings.language === 'auto' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="selectLanguage('auto')">{{ t('settings.language_auto') }}</div>
                  <div class="context-menu-item" :style="{ color: settings.language === 'en' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="selectLanguage('en')">English</div>
                  <div class="context-menu-item" :style="{ color: settings.language === 'pl' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="selectLanguage('pl')">Polski</div>
                  <div class="context-menu-item" :style="{ color: settings.language === 'uk' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="selectLanguage('uk')">Українська</div>
                </div>
              </div>
            </div>

            <!-- Theme -->
            <div class="form-group flex-1">
              <label>{{ t('settings.theme') }}</label>
              <div class="sort-trigger-wrapper" @click.stop="themeDropdownOpen = !themeDropdownOpen">
                <button class="btn sort-trigger" style="width: 100%; justify-content: space-between;">
                  <span>{{ getThemeLabel(settings.theme) }}</span>
                  <span class="material-symbols-outlined" style="font-size:20px;">expand_more</span>
                </button>
                <div v-if="themeDropdownOpen" class="context-menu" style="position: absolute; width: 100%; top: 100%; margin-top: 4px; z-index: 100;">
                  <div class="context-menu-item" :style="{ color: settings.theme === 'auto' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="selectTheme('auto')">{{ t('settings.theme_auto') }}</div>
                  <div class="context-menu-item" :style="{ color: settings.theme === 'dark' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="selectTheme('dark')">{{ t('settings.theme_dark') }}</div>
                  <div class="context-menu-item" :style="{ color: settings.theme === 'light' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="selectTheme('light')">{{ t('settings.theme_light') }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- App Statistics Badges -->
          <div class="settings-stats-row">
            <div class="stat-badge">
              <span class="material-symbols-outlined stat-icon">folder_zip</span>
              <div class="stat-info">
                <span class="stat-num">{{ setsCount }}</span>
                <span class="stat-lbl">{{ t('settings.sets_stat') }}</span>
              </div>
            </div>
            <div class="stat-badge">
              <span class="material-symbols-outlined stat-icon">inventory_2</span>
              <div class="stat-info">
                <span class="stat-num">{{ itemsCount }}</span>
                <span class="stat-lbl">{{ t('settings.items_stat') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cache & Game Optimization -->
        <div class="card">
          <h3 class="settings-card-title">
            <span class="material-symbols-outlined title-icon">speed</span>
            {{ t('settings.game_optimization') }}
          </h3>

          <div class="settings-form-flex" style="flex-direction: column; gap: 1.25rem;">
            <!-- Cache Method -->
            <div class="form-group">
              <label>{{ t('settings.cache_method') }}</label>
              <div class="sort-trigger-wrapper" @click.stop="cacheMethodDropdownOpen = !cacheMethodDropdownOpen">
                <button class="btn sort-trigger" style="width: 100%; justify-content: space-between;">
                  <span>{{ getCacheMethodLabel(settings.cacheMethod) }}</span>
                  <span class="material-symbols-outlined" style="font-size:20px;">expand_more</span>
                </button>
                <div v-if="cacheMethodDropdownOpen" class="context-menu" style="position: absolute; width: 100%; top: 100%; margin-top: 4px; z-index: 100;">
                  <div class="context-menu-item" :style="{ color: settings.cacheMethod === 'Dynamic' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCacheMethod('Dynamic')">
                    {{ t('settings.cache_method_dynamic') }}
                  </div>
                  <div class="context-menu-item" :style="{ color: settings.cacheMethod === 'Static' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCacheMethod('Static')">
                    {{ t('settings.cache_method_static') }}
                  </div>
                </div>
              </div>
              <div class="form-text" style="margin-top: 0.4rem;">
                {{ settings.cacheMethod === 'Static' ? t('settings.cache_method_static_desc') : t('settings.cache_method_dynamic_desc') }}
              </div>
            </div>

            <!-- Compression Level -->
            <div class="form-group">
              <label>{{ t('settings.cache_compression') }}</label>
              <div class="sort-trigger-wrapper" @click.stop="compressionDropdownOpen = !compressionDropdownOpen">
                <button class="btn sort-trigger" style="width: 100%; justify-content: space-between;">
                  <span>{{ getCompressionLabel(settings.compressionLevel) }}</span>
                  <span class="material-symbols-outlined" style="font-size:20px;">expand_more</span>
                </button>
                <div v-if="compressionDropdownOpen" class="context-menu" style="position: absolute; width: 100%; top: 100%; margin-top: 4px; z-index: 100;">
                  <div class="context-menu-item" :style="{ color: settings.compressionLevel === 0 ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCompressionLevel(0)">{{ t('settings.no_compression') }}</div>
                  <div class="context-menu-item" :style="{ color: settings.compressionLevel === 1 ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCompressionLevel(1)">{{ t('settings.low_compression') }}</div>
                  <div class="context-menu-item" :style="{ color: settings.compressionLevel === 2 ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCompressionLevel(2)">{{ t('settings.medium_compression') }}</div>
                  <div class="context-menu-item" :style="{ color: settings.compressionLevel === 3 ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCompressionLevel(3)">{{ t('settings.high_compression') }}</div>
                  <div class="context-menu-item" :style="{ color: settings.compressionLevel === 4 ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="setCompressionLevel(4)">{{ t('settings.very_high_compression') }}</div>
                </div>
              </div>
              <div class="form-text" style="margin-top: 0.4rem;">
                {{ t('settings.compression_desc') }}
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: Folder Configuration & Maintenance -->
      <div class="settings-col">

        <!-- Folder Configurations & Downloads -->
        <div class="card">
          <div class="settings-folder-header">
            <h3 class="settings-card-title m-0">
              <span class="material-symbols-outlined title-icon">folder_open</span>
              {{ t('settings.configure_folders') }}
            </h3>
            <span v-if="saving" class="settings-saving-text">
               <span class="material-symbols-outlined spin icon-14">progress_activity</span>
               {{ t('settings.saving') }}
            </span>
            <span v-else-if="saved" class="settings-saved-text">
               <span class="material-symbols-outlined icon-14">check</span>
               {{ t('settings.saved') }}
            </span>
          </div>

          <div class="settings-form-flex" style="flex-direction: column; gap: 1rem;">
            <!-- Document Base Dir -->
            <div class="form-group">
              <label>{{ t('settings.doc_dir') }}</label>
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" v-model="settings.documentBaseDir" class="form-control" style="flex: 1;" @blur="onBaseDirBlur" />
                <button class="btn btn-secondary" style="padding: 0 1rem;" @click="browseDocumentBaseDir">{{ t('settings.browse') }}</button>
              </div>
              <div class="form-text">{{ t('settings.doc_dir_desc') }}</div>
            </div>

            <!-- Game Files Dir -->
            <div class="form-group">
              <label>{{ t('settings.game_dir') }}</label>
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" v-model="settings.gameFilesDir" class="form-control" style="flex: 1;" @blur="onGameFilesDirBlur" placeholder="e.g. C:\Program Files\EA Games\The Sims 3" />
                <button class="btn btn-secondary" style="padding: 0 1rem;" @click="browseGameFilesDir">{{ t('settings.browse') }}</button>
              </div>
              <div class="form-text">{{ t('settings.game_dir_desc') }}</div>
            </div>

            <!-- Auto Import Box -->
            <div class="auto-import-box">
              <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">{{ t('settings.auto_import_title') }}</div>
              <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.75rem; line-height: 1.4;">
                {{ t('settings.auto_import_desc') }}
              </div>
              <button class="btn btn-info-outline" id="btn-import-downloads" style="width: 100%; justify-content: center;" @click="runImportDownloads">
                <span class="material-symbols-outlined icon-16-mr">download</span>
                {{ t('settings.import_downloads_btn') }}
              </button>
            </div>

            <!-- Observed Folders Section -->
            <div class="observed-folders-section" style="border-top: 1px solid var(--border-subtle, rgba(255,255,255,0.08)); padding-top: 1rem; margin-top: 0.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <label style="font-weight: 600; font-size: 0.95rem; margin: 0;">{{ t('settings.observed_folders_title') }}</label>
                <button class="btn btn-secondary btn-sm" style="font-size: 0.8rem; padding: 2px 10px; display: flex; align-items: center;" @click="browseObservedFolder">
                  <span class="material-symbols-outlined icon-14" style="margin-right: 4px;">add</span>
                  {{ t('settings.add_observed_folder') }}
                </button>
              </div>
              <div class="form-text" style="margin-bottom: 0.75rem;">{{ t('settings.observed_folders_desc') }}</div>

              <div v-if="settings.observedFolders && settings.observedFolders.length > 0" class="observed-folders-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div v-for="(folderPath, idx) in settings.observedFolders" :key="idx" class="observed-folder-item" style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-secondary, rgba(255,255,255,0.03)); border: 1px solid var(--border-subtle, rgba(255,255,255,0.08)); padding: 0.4rem 0.75rem; border-radius: 6px;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
                    <span class="material-symbols-outlined" style="font-size: 18px; color: var(--primary, #6366f1);">folder</span>
                    <span style="font-size: 0.85rem; color: var(--text-main, #f8fafc); overflow: hidden; text-overflow: ellipsis;">{{ folderPath }}</span>
                  </div>
                  <button class="btn-icon" style="background: none; border: none; color: var(--text-muted, #94a3b8); cursor: pointer; padding: 2px; border-radius: 4px; display: flex; align-items: center;" title="Remove folder" @click="removeObservedFolder(idx)">
                    <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
                  </button>
                </div>
              </div>
              <div v-else class="observed-folder-default-badge" style="font-size: 0.82rem; font-style: italic; color: var(--text-muted, #94a3b8); background: var(--bg-secondary, rgba(255,255,255,0.02)); border: 1px dashed var(--border-subtle, rgba(255,255,255,0.1)); padding: 0.5rem 0.75rem; border-radius: 6px;">
                <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom; margin-right: 4px; color: var(--primary, #6366f1);">info</span>
                {{ t('settings.default_observed_folder_hint') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Maintenance & Tools -->
        <div class="card">
          <h3 class="settings-card-title">
            <span class="material-symbols-outlined title-icon">build</span>
            {{ t('settings.maintenance_utilities') }}
          </h3>
          <p class="settings-migrate-text" style="margin-bottom: 0.75rem;">
            {{ t('settings.troubleshooting_desc') }}
          </p>

          <div class="maintenance-buttons-grid">
            <button class="btn btn-purple-outline" id="btn-recheck-types" @click="confirmRecheckTypes">
              <span class="material-symbols-outlined icon-16-mr">analytics</span>
              {{ t('settings.recheck_types') }}
            </button>
            <button class="btn btn-success-outline" id="btn-autofix" @click="confirmAutoFix">
              <span class="material-symbols-outlined icon-16-mr">build</span>
              {{ t('settings.autofix') }}
            </button>
            <button class="btn btn-migrate" id="btn-migrate" @click="onMigrate">
              <span class="material-symbols-outlined icon-16-mr">upgrade</span>
              {{ t('settings.migrate_btn') }}
            </button>
          </div>
        </div>

      </div>

    </div>

    <!-- Special Thanks Banner -->
    <div class="card settings-full-width thanks-banner">
      <h3 class="settings-card-title" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        {{ t('settings.special_thanks') }} <span class="material-symbols-outlined" style="color: #ef4444; font-variation-settings: 'FILL' 1;">favorite</span>
      </h3>
      <div style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; text-align: center;">
        <span>Thanks to granthes for <a href="https://modthesims.info/d/461888/" target="_blank" style="color: var(--primary); text-decoration: none;">CC Magic</a> &amp; S3ToolKit. </span>
        <span>Thanks to Peter for <a href="https://s3pi.sourceforge.net/" target="_blank" style="color: var(--primary); text-decoration: none;">s3pi</a>. </span>
        <span style="display: inline-block; margin-left: 0.5rem;">
          <a href="https://github.com/PlumbobForge" target="_blank" style="color: var(--primary); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
            <span class="material-symbols-outlined" style="font-size: 16px;">code</span> Source Code
          </a>
        </span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { fetchSettings, saveSettings as saveSettingsApi, autodetectSettings, validateGameFiles, migrate, startScan, autoFixDatabase, startRecheckTypes, fetchSets, fetchItems, importDownloads, checkDownloadsDuplicates } from '@/api/client'
import { useModal } from '@/composables/useModal'
import { useToast } from '@/composables/useToast'
import { useAppStore } from '@/stores/app'
import { useI18n } from '@/composables/useI18n'
import { useTheme } from '@/composables/useTheme'

const { showConfirm, showProgress, showRecheckConfirm, showDuplicateImportModal } = useModal()
const { showToast } = useToast()
const store = useAppStore()
const { t, setLanguage } = useI18n()
const { setTheme } = useTheme()

const settings = ref({
  documentBaseDir: '',
  managedPackageFolderName: 'Library',
  setCacheFolderName: 'Builds',
  compressionLevel: 1,
  cacheMethod: 'Dynamic',
  gameFilesDir: '',
  language: 'auto',
  theme: 'auto',
  observedFolders: [] as string[]
})

let initialBaseDir = ''
let initialGameFilesDir = ''

const saving = ref(false)
const saved = ref(false)
const isInitialLoad = ref(true)

const cacheMethodDropdownOpen = ref(false)
const compressionDropdownOpen = ref(false)
const languageDropdownOpen = ref(false)
const themeDropdownOpen = ref(false)

const closeDropdowns = () => {
  if (cacheMethodDropdownOpen.value) cacheMethodDropdownOpen.value = false
  if (compressionDropdownOpen.value) compressionDropdownOpen.value = false
  if (languageDropdownOpen.value) languageDropdownOpen.value = false
  if (themeDropdownOpen.value) themeDropdownOpen.value = false
}

const getCacheMethodLabel = (method: string) => {
  return method === 'Static' ? t('settings.cache_method_static') : t('settings.cache_method_dynamic')
}

const setCacheMethod = (method: string) => {
  const isChanged = settings.value.cacheMethod !== method
  settings.value.cacheMethod = method
  cacheMethodDropdownOpen.value = false
  store.cacheMethod = method
  if (isChanged) {
    store.isDirty = true
  }
  onSettingsChange()
}

const getLanguageLabel = (lang: string) => {
  switch (lang) {
    case 'auto': return t('settings.language_auto')
    case 'en': return 'English'
    case 'pl': return 'Polski'
    case 'uk': return 'Українська'
    default: return t('settings.language_auto')
  }
}

const selectLanguage = (lang: string) => {
  settings.value.language = lang
  languageDropdownOpen.value = false
  setLanguage(lang)
  onSettingsChange()
}

const getThemeLabel = (theme: string) => {
  switch (theme) {
    case 'auto': return t('settings.theme_auto')
    case 'dark': return t('settings.theme_dark')
    case 'light': return t('settings.theme_light')
    default: return t('settings.theme_auto')
  }
}

const selectTheme = (theme: string) => {
  settings.value.theme = theme
  themeDropdownOpen.value = false
  setTheme(theme)
  onSettingsChange()
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})

const getCompressionLabel = (level: number) => {
  switch (level) {
    case 0: return t('settings.no_compression')
    case 1: return t('settings.low_compression')
    case 2: return t('settings.medium_compression')
    case 3: return t('settings.high_compression')
    case 4: return t('settings.very_high_compression')
    default: return t('settings.low_compression')
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
      t('settings.move_folder_title'),
      t('settings.move_folder_msg', { oldPath: initialBaseDir, newPath: settings.value.documentBaseDir })
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
      CompressionLevel: settings.value.compressionLevel,
      ObservedFolders: settings.value.observedFolders
    }, moveFolder)

    saving.value = false;
    saved.value = true;
    initialBaseDir = settings.value.documentBaseDir; // Update the reference point
    setTimeout(() => { saved.value = false }, 3000);
  } catch (e: any) {
    saving.value = false;
    showToast(e.message || t('cm.failed_toast'), 'error');
    // Revert visually on error
    settings.value.documentBaseDir = initialBaseDir;
  }
}

const onGameFilesDirBlur = async () => {
  if (settings.value.gameFilesDir === initialGameFilesDir) return;

  if (settings.value.gameFilesDir.trim() !== '') {
    try {
      const res = await validateGameFiles(settings.value.gameFilesDir)
      if (!res.valid) {
        const proceed = await showConfirm(t('settings.warning_title'), t('settings.invalid_game_dir_msg'));
        if (!proceed) {
          settings.value.gameFilesDir = initialGameFilesDir;
          return;
        }
      } else if (res.normalizedPath) {
        settings.value.gameFilesDir = res.normalizedPath;
      }
    } catch (e) {
      const proceed = await showConfirm(t('settings.warning_title'), t('settings.game_dir_error_msg'));
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
      CompressionLevel: settings.value.compressionLevel,
      ObservedFolders: settings.value.observedFolders
    }, false)

    saving.value = false;
    saved.value = true;
    initialGameFilesDir = settings.value.gameFilesDir;
    setTimeout(() => { saved.value = false }, 3000);
  } catch (e: any) {
    saving.value = false;
    showToast(e.message || t('cm.failed_toast'), 'error');
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
      CompressionLevel: settings.value.compressionLevel,
      CacheMethod: settings.value.cacheMethod,
      Language: settings.value.language,
      Theme: settings.value.theme,
      ObservedFolders: settings.value.observedFolders
    }, false)

    saving.value = false;
    saved.value = true;
    setTimeout(() => { saved.value = false }, 3000);
  } catch (e: any) {
    saving.value = false;
    showToast(e.message || t('cm.failed_toast'), 'error');
  }
}

const browseObservedFolder = async () => {
  if ((window as any).electronAPI) {
    const selectedPath = await (window as any).electronAPI.selectDirectory();
    if (selectedPath) {
      if (!settings.value.observedFolders) settings.value.observedFolders = [];
      if (!settings.value.observedFolders.includes(selectedPath)) {
        settings.value.observedFolders.push(selectedPath);
        await onSettingsChange();
      }
    }
  }
}

const removeObservedFolder = async (index: number) => {
  if (settings.value.observedFolders && index >= 0 && index < settings.value.observedFolders.length) {
    settings.value.observedFolders.splice(index, 1);
    await onSettingsChange();
  }
}

onMounted(async () => {
  try {
    const data = await fetchSettings()
    settings.value.documentBaseDir = data.documentBaseDir || data.DocumentBaseDir || ''
    settings.value.managedPackageFolderName = 'Library'
    settings.value.setCacheFolderName = 'Builds'
    settings.value.compressionLevel = data.compressionLevel ?? data.CompressionLevel ?? 1
    settings.value.cacheMethod = data.cacheMethod || data.CacheMethod || 'Dynamic'
    store.cacheMethod = settings.value.cacheMethod
    settings.value.gameFilesDir = data.gameFilesDir || data.GameFilesDir || ''
    settings.value.language = data.language || data.Language || 'auto'
    settings.value.theme = data.theme || data.Theme || 'auto'
    settings.value.observedFolders = data.observedFolders || data.ObservedFolders || []
    setLanguage(settings.value.language)
    setTheme(settings.value.theme)

    initialBaseDir = settings.value.documentBaseDir
    initialGameFilesDir = settings.value.gameFilesDir

    const [sets, items] = await Promise.all([
      fetchSets().catch(() => []),
      fetchItems().catch(() => [])
    ])
    setsCount.value = sets.length
    itemsCount.value = items.length

    setTimeout(() => { isInitialLoad.value = false }, 500)
  } catch (err: any) {
    console.error('Failed to load settings:', err)
    isInitialLoad.value = false
  }
})

const onMigrate = async () => {
  if (await showConfirm(
    t('settings.migrate_confirm_title'),
    t('settings.migrate_confirm_msg')
  )) {
    try {
      const data = await migrate()
      if (data && data.copied > 0) {
        showToast(t('settings.migrate_success', { count: data.copied }), 'success')
      } else {
        showToast(t('settings.migrate_no_files'), 'info')
      }
    } catch (e: any) {
      showToast(e.message || t('settings.migrate_error'), 'error')
    }
  }
}

const runImportDownloads = async () => {
  try {
    const dupCheck = await checkDownloadsDuplicates()
    let duplicateAction = 'rename'

    if (dupCheck.hasDuplicates) {
      const choice = await showDuplicateImportModal(dupCheck.duplicates)
      if (!choice) return // User cancelled import
      duplicateAction = choice
    }

    const progress = showProgress(t('settings.import_downloads_btn'))
    const res = await importDownloads(duplicateAction)
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
            const [sets, items] = await Promise.all([
              fetchSets().catch(() => []),
              fetchItems().catch(() => [])
            ])
            setsCount.value = sets.length
            itemsCount.value = items.length
            store.lastImportedAt = Date.now()
            showToast('Imported items from Downloads successfully!', 'success')
            window.dispatchEvent(new CustomEvent('items-updated'))
            return
          }
          progress.appendLog(msg)
        }
      }
    }
  } catch (err: any) {
    showToast(err.message || 'Failed to import downloads', 'error')
  }
}

const confirmRunScan = async () => {
  if (await showConfirm(
    t('settings.rebuild_cache_title'),
    t('settings.recheck_confirm_msg')
  )) {
    runScan()
  }
}

const runScan = async () => {
  const progress = showProgress(t('settings.rebuild_cache_title'))
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
  const result = await showRecheckConfirm()
  if (result && result.confirmed) {
    runRecheckTypes(result.skipUserTagged)
  }
}

const runRecheckTypes = async (skipUserTagged: boolean = true) => {
  const progress = showProgress(t('settings.recheck_types_title'))
  try {
    const res = await startRecheckTypes(skipUserTagged)
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
            showToast(t('cm.items_toggled_toast'), 'success')
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
    t('settings.autofix_confirm_title'),
    t('settings.autofix_confirm_msg')
  )) {
    runAutoFix()
  }
}

const runAutoFix = async () => {
  const progress = showProgress(t('settings.autofix_title'))
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

const openChangelog = () => {
  window.dispatchEvent(new CustomEvent('open-changelog'))
}
</script>
