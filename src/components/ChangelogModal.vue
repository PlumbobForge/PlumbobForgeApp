<template>
  <div v-if="visible" class="modal-overlay" style="display: flex; z-index: 9999;" @click.self="emit('close')">
    <div class="modal changelog-modal" style="max-width: 680px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; padding: 0; overflow: hidden; border-radius: 12px;">

        <div class="changelog-header" style="color: white;padding: 1.5rem 1.75rem;position: relative;border-bottom: 1px solid var(--border-subtle);">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div>
              <h2 style="margin: 0.25rem 0 0 0; font-size: 1.35rem; font-weight: 700; color: white;">The Biggest Update Yet: What’s New in 0.2.0</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="changelog-body" style="padding: 1.5rem 1.75rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1.5rem;">

        <div>
          <h3 style="margin: 0 0 0.5rem 0;font-size: 1.1rem;color: var(--text-color, #e2e8f0);display: flex;align-items: center;gap: 0.5rem;">
            <span class="material-symbols-outlined" style="font-size: 20px;">translate</span>
            Cześć! Привіт!
          </h3>
          <p style="margin: 0; font-size: 0.9rem; line-height: 1.5; color: var(--text-color, #e2e8f0);">
            PlumbobForge now fully supports <strong>Polish and Ukrainian,</strong>. with more languages on their way.
          </p>
        </div>

        <div style="border-top: 1px solid var(--border-color, rgba(255,255,255,0.1)); padding-top: 1rem;">
          <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 700;">Major Improvements</h3>
          <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted, #94a3b8);">
            Thanks to your feedback, we’ve made sweeping improvements across the entire app. Here are the highlights:
          </p>
        </div>

        <div class="changelog-section">
          <h4 style="margin: 0 0 0.75rem 0; font-size: 1rem; color: var(--text-color, #e2e8f0); display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.2rem;">⚙️</span> Configurations
          </h4>
          <ul style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.88rem; line-height: 1.5; color: var(--text-muted, #cbd5e1);">
            <li><strong>Better Management:</strong> Sort, duplicate, and add descriptions to your configurations.</li>
            <li><strong>Multi-Select & Drag:</strong> Select and drag multiple sets at once for effortless organizing.</li>
            <li><strong>Clearer Set Hierarchy:</strong> Sets now display their total sub-set count, and sub-sets clearly show their parent set.</li>
            <li><strong>One-Click Moves:</strong> Move an entire set along with all of its sub-sets in a single click.</li>
          </ul>
        </div>

        <div class="changelog-section">
          <h4 style="margin: 0 0 0.75rem 0; font-size: 1rem; color: var(--text-color, #e2e8f0); display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.2rem;">📦</span> Content Manager
          </h4>
          <ul style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.88rem; line-height: 1.5; color: var(--text-muted, #cbd5e1);">
            <li><strong>Easier Navigation:</strong> Drag, drop, select, and sort sets</li>
            <li><strong>Better CAS Sorting:</strong> Sort CAS items by age, gender, and outfit category</li>
            <li><strong>Custom User Tags:</strong> Add your own custom tags to keep items organized your way</li>
            <li><strong>More Sub-Categories:</strong> Worlds, Sims, and Lots now have their own sub-categories <em>(Please recheck package types in settings to apply changes)</em></li>
            <li><strong>Manual Recategorization:</strong> Change item categories manually whenever something is wrong</li>
            <li><strong>Direct Archive Import:</strong> Import items directly from <code style="background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 4px;">.zip</code>, <code style="background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 4px;">.rar</code>, and <code style="background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 4px;">.7z</code> files</li>
            <li><strong>Smarter Drag-and-Drop:</strong> Dragging files into the app now places them into your current set instead of all items.</li>
            <li><strong>Auto-Folder Watching:</strong> PlumbobForge now automatically monitors the TS3 Downloads and your own custom folders. No manual refresh button required</li>
            <li><strong>Duplicate Handling:</strong> Improved detection and management for duplicate items</li>
          </ul>
        </div>

        <div class="changelog-section">
          <h4 style="margin: 0 0 0.75rem 0; font-size: 1rem; color: var(--text-color, #e2e8f0); display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.2rem;">🛠️</span> Settings & Caching
          </h4>
          <ul style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.88rem; line-height: 1.5; color: var(--text-muted, #cbd5e1);">
            <li><strong>New "Static" Caching Method:</strong> Similar to S3MO, this merges all sets into single files rather than caching them separately</li>
            <li><strong>Reorganized Settings:</strong> The page has been redesigned for better organization and accessibility</li>
          </ul>
        </div>

        <div class="changelog-section">
          <h4 style="margin: 0 0 0.75rem 0; font-size: 1rem; color: var(--text-color, #e2e8f0); display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.2rem;">✨</span> General & App Upgrades
          </h4>
          <ul style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.88rem; line-height: 1.5; color: var(--text-muted, #cbd5e1);">
            <li><strong>Light Mode:</strong> A new white theme for the app</li>
            <li><strong>Better Performance:</strong> App startup is up to <strong>50% faster</strong>, and cache rebuilding is up to <strong>25% faster</strong> (depending on your setup)</li>
            <li><strong>Shutdown Warnings:</strong> Added a warning to rebuild your cache before closing so you never miss it</li>
            <li><strong>20+ Bug Fixes:</strong> Patched over twenty reported bugs and issues</li>
          </ul>
        </div>

        <p style="margin: 0.5rem 0 0 0; font-size: 0.88rem; font-style: italic; color: var(--text-muted, #94a3b8); border-top: 1px solid var(--border-color, rgba(255,255,255,0.1)); padding-top: 0.75rem;">
          Thank you to everyone in the community for your testing, feedback, and support. This update wouldn't be possible without you!
        </p>
      </div>

      <div class="changelog-footer" style="padding: 1rem 1.75rem; background: var(--bg-secondary, rgba(0,0,0,0.2)); border-top: 1px solid var(--border-color, rgba(255,255,255,0.1)); display: flex; justify-content: flex-end;">
        <button class="btn btn-primary" style="padding: 0.6rem 1.5rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;" @click="emit('close')">
          <span>Continue</span>
          <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.btn-close:hover {
  background: rgba(255,255,255,0.3) !important;
}
</style>
