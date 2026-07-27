<template>
  <div id="view-configurations" class="view">
    
    <div class="content-manager-layout">
      
      <!-- Sidebar: Configurations Tree -->
      <div class="cm-sidebar">
        <div class="cm-sidebar-header">
          Configurations
          <button id="btn-create-config" class="btn btn-create-config" @click="createConfig">+ New</button>
        </div>
        <div class="cm-tree-view" id="config-tree-view">
          <div v-if="loading && allConfigs.length === 0" class="config-loading">Loading...</div>
          <div v-for="config in allConfigs" :key="config.id" class="tree-item config-tree-item-flex" :class="{ active: currentConfig && currentConfig.id === config.id }" @click="selectConfig(config)" @contextmenu.prevent="onConfigContextMenu($event, config)">
            <span class="tree-label">
              <span class="tree-icon material-symbols-outlined">tune</span>
              {{ config.name }}
            </span>
            <span v-if="config.active" class="badge-active">ACTIVE</span>
            <span v-else-if="config.default" class="badge-default">DEFAULT</span>
          </div>
        </div>
      </div>
      
      <!-- Main: Sets Checkboxes -->
      <div class="cm-main">
        <div class="cm-main-header">
          <h3 id="config-title" :class="{ 'config-title-clickable': currentConfig && !currentConfig.default }" :title="currentConfig && !currentConfig.default ? 'Click to rename' : ''" @click="currentConfig && handleRenameConfig(currentConfig)">
            {{ currentConfig ? currentConfig.name : 'No configuration selected' }}
          </h3>
          <div class="cm-items-stats config-stats" id="config-stats">
            <span v-if="currentConfig">{{ currentConfig.setIds.length }} sets enabled</span>
          </div>
        </div>
        <div class="config-main-flex">
           
           <!-- Enabled Sets Column -->
           <div class="config-panel">
             <div class="config-panel-header-primary">
               Enabled Sets
             </div>
             <div class="drop-zone config-drop-zone" id="config-enabled-sets" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop="onDrop($event, true)">
                <div v-for="set in enabledSets" :key="set.id" draggable="true" class="config-set-card" @dragstart="onDragStart($event, set)">
                  <span class="material-symbols-outlined config-set-icon">sell</span>
                  {{ set.name }}
                </div>
             </div>
           </div>

           <!-- Disabled Sets Column -->
           <div class="config-panel">
             <div class="config-panel-header-muted">
               Disabled Sets
             </div>
             <div class="drop-zone config-drop-zone" id="config-disabled-sets" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop="onDrop($event, false)">
                <div v-for="set in disabledSets" :key="set.id" draggable="true" class="config-set-card" @dragstart="onDragStart($event, set)">
                  <span class="material-symbols-outlined config-set-icon">sell</span>
                  {{ set.name }}
                </div>
             </div>
           </div>
           
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchConfigurations, fetchSets, createConfiguration, deleteConfiguration, activateConfiguration, updateConfigurationSets, renameConfiguration } from '@/api/client'
import { useModal } from '@/composables/useModal'
import { useToast } from '@/composables/useToast'
import { useContextMenu } from '@/composables/useContextMenu'
import type { Configuration, SetEntity } from '@/types'

const { showPrompt, showConfirm } = useModal()
const { showToast } = useToast()
const { showContextMenu } = useContextMenu()

const allConfigs = ref<Configuration[]>([])
const allSets = ref<SetEntity[]>([])
const currentConfig = ref<Configuration | null>(null)
const loading = ref(true)

const enabledSets = computed(() => {
  if (!currentConfig.value) return []
  return allSets.value.filter(s => currentConfig.value!.setIds.includes(s.id))
})

const disabledSets = computed(() => {
  if (!currentConfig.value) return []
  return allSets.value.filter(s => !currentConfig.value!.setIds.includes(s.id))
})

const loadData = async () => {
  loading.value = true
  try {
    const [configsRes, setsRes] = await Promise.all([fetchConfigurations(), fetchSets()])
    allConfigs.value = configsRes
    allSets.value = setsRes
    
    if (currentConfig.value) {
      const updated = allConfigs.value.find(c => c.id === currentConfig.value!.id)
      selectConfig(updated || allConfigs.value[0] || null)
    } else if (allConfigs.value.length > 0) {
      const active = allConfigs.value.find(c => c.active)
      selectConfig(active || allConfigs.value[0])
    }
  } catch (err) {
    showToast('Failed to load configurations', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

const selectConfig = async (config: Configuration | null) => {
  const isChanging = config && (!currentConfig.value || currentConfig.value.id !== config.id)
  currentConfig.value = config ? { ...config, setIds: [...config.setIds] } : null
  
  if (isChanging && currentConfig.value && !currentConfig.value.active) {
    await activateConfig()
  }
}

const createConfig = async () => {
  const name = await showPrompt('Enter new configuration name:')
  if (!name || name.trim() === '') return
  try {
    const newConfig = await createConfiguration()
    await renameConfiguration(newConfig.id, name.trim())
    await loadData()
    selectConfig(allConfigs.value.find(c => c.id === newConfig.id) || null)
  } catch (err) {
    showToast('Failed to create configuration', 'error')
  }
}

const onConfigContextMenu = (e: MouseEvent, config: Configuration) => {
  if (config.default) return;

  const menuItems = [
    { 
      label: 'Rename', 
      icon: 'edit',
      action: () => handleRenameConfig(config),
      disabled: config.default
    },
    { 
      label: 'Delete', 
      icon: 'delete',
      action: () => handleDeleteConfig(config), 
      disabled: config.default || config.active, 
      danger: true 
    }
  ]
  showContextMenu(e.pageX, e.pageY, menuItems)
}

const handleRenameConfig = async (config: Configuration) => {
  if (!config || config.default) return
  const newName = await showPrompt('Rename Configuration')
  if (!newName || !newName.trim()) return
  try {
    await renameConfiguration(config.id, newName.trim())
    await loadData()
  } catch (err) {
    showToast('Failed to rename configuration', 'error')
  }
}

const handleDeleteConfig = async (config: Configuration) => {
  if (!config || config.default || config.active) return
  if (await showConfirm('Delete Configuration', `Are you sure you want to delete '${config.name}'?`)) {
    try {
      await deleteConfiguration(config.id)
      if (currentConfig.value && currentConfig.value.id === config.id) {
        currentConfig.value = null
      }
      await loadData()
      showToast('Configuration deleted', 'success')
    } catch (err) {
      showToast('Failed to delete configuration', 'error')
    }
  }
}

const activateConfig = async () => {
  if (!currentConfig.value || currentConfig.value.active) return
  try {
    await activateConfiguration(currentConfig.value.id)
    showToast(`${currentConfig.value.name} is now the active configuration. Game files updated!`, 'success')
    await loadData()
  } catch (err) {
    showToast('Failed to activate configuration', 'error')
  }
}

const onDragStart = (e: DragEvent, set: SetEntity) => {
  e.dataTransfer!.setData('application/json', JSON.stringify({ type: 'config-set', setId: set.id }))
  ;(e.target as HTMLElement).style.opacity = '0.5'
}

const onDragOver = (e: DragEvent) => {
  ;(e.currentTarget as HTMLElement).style.background = 'rgba(0, 0, 0, 0.05)'
}

const onDragLeave = (e: DragEvent) => {
  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
}

const onDrop = async (e: DragEvent, enable: boolean) => {
  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
  const data = e.dataTransfer?.getData('application/json')
  if (!data || !currentConfig.value) return
  try {
    const parsed = JSON.parse(data)
    if (parsed.type === 'config-set') {
      const setId = parsed.setId
      let newSetIds = [...currentConfig.value.setIds]
      if (enable && !newSetIds.includes(setId)) {
        newSetIds.push(setId)
      } else if (!enable && newSetIds.includes(setId)) {
        newSetIds = newSetIds.filter(id => id !== setId)
      }
      
      if (newSetIds.length !== currentConfig.value.setIds.length) {
        currentConfig.value.setIds = newSetIds
        await updateConfigurationSets(currentConfig.value.id, newSetIds)
      }
    }
  } catch (err) {
    showToast('Failed to update sets', 'error')
    loadData()
  }
}
</script>
