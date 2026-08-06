<template>
  <div id="view-content" class="view">
    <div class="content-manager-layout">

      <!-- Sidebar: Sets Tree -->
      <div class="cm-sidebar" id="cm-sidebar" @contextmenu.prevent="onSidebarContextMenu" @dragover.prevent @drop.prevent="onDropSidebar">
        <div class="cm-sidebar-header" style="position: relative; display: flex; align-items: center; justify-content: space-between;">
          <span>{{ t('cm.sets') }}</span>
          <div style="display: flex; align-items: center; gap: 0.25rem;">
            <button class="btn sort-trigger" style="padding: 4px 8px; font-size: 0.8rem; display: flex; align-items: center; gap: 4px;" :data-tooltip="t('cm.sort_sets')" @click.stop="toggleSetSortDropdown">
              <span class="material-symbols-outlined" style="font-size: 16px;">sort</span>
            </button>
            <button id="btn-create-set" class="btn btn-sm" @click.stop="createSet">+</button>
          </div>
          <div v-if="setSortDropdownOpen" class="context-menu dropdown-menu-left" style="top: 15%; left: 0; min-width: 150px; z-index: 100;">
            <div class="context-menu-item" :class="{ active: setSortBy === 'date' }" @click="setSortBy = 'date'; setSortDropdownOpen = false">
              {{ t('cm.sort_date') }}
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" :class="{ active: setSortBy === 'name_asc' }" @click="setSortBy = 'name_asc'; setSortDropdownOpen = false">
              {{ t('cm.sort_name_asc') }}
            </div>
            <div class="context-menu-item" :class="{ active: setSortBy === 'name_desc' }" @click="setSortBy = 'name_desc'; setSortDropdownOpen = false">
              {{ t('cm.sort_name_desc') }}
            </div>
          </div>
        </div>
        <div class="cm-tree-view" id="cm-tree-view" v-if="loadingSets">
          <div class="text-muted-padded">Loading Sets...</div>
        </div>
        <div class="cm-tree-view" id="cm-tree-view" v-else>
          <!-- All Items Node -->
          <div class="tree-item" :class="{ active: store.selectedSetId === null, 'drag-over': isDragOverAll }" @click="selectSet(null)" @contextmenu.prevent.stop @dragover.prevent="isDragOverAll = true" @dragleave="isDragOverAll = false" @drop="onDropAll($event)">
            <span class="tree-label">
              <span class="tree-icon material-symbols-outlined">layers</span>
              All Items
            </span>
          </div>

          <!-- Recursive Tree -->
          <SetTreeNode
            v-for="set in rootSets"
            :key="set.id"
            :set="set"
            :allSets="allSets"
            :depth="0"
            @select="selectSet"
            @context-menu="onSetContextMenu"
            @drop="onDropSet"
          />
        </div>
      </div>

      <!-- Main Area: Items Grid -->
      <div class="cm-main"
        @dragenter.prevent="onDragEnter"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDropFiles"
        style="position: relative;"
      >
        <div v-if="isDraggingFiles" class="drop-overlay">
          <div class="drop-message">
            <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 1rem;">upload_file</span>
            <h2>Drop files to import</h2>
          </div>
        </div>
        <div class="cm-main-header">
          <div class="cm-header-flex gap-4">
            <h3 id="cm-items-title">{{ currentSetName }}</h3>
            <div class="cm-items-stats" id="cm-items-stats" style="color: var(--text-muted); font-size: 0.9rem;">
              {{ filteredItems.length }} Item(s) - {{ formatSize(totalSize) }}
            </div>
          </div>
          <div class="cm-header-flex gap-2">
            <!-- Sort Dropdown -->
            <div class="sort-trigger-wrapper" @click.stop="sortDropdownOpen = !sortDropdownOpen">
              <button class="btn sort-trigger">
                <span class="material-symbols-outlined" style="font-size:20px;">sort</span>
                Sort
              </button>
              <div v-if="sortDropdownOpen" class="context-menu dropdown-menu-right">
                <div class="context-menu-item" :style="{ color: sortMode === 'date_desc' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="sortMode = 'date_desc'; sortDropdownOpen = false">
                  Latest
                </div>
                <div class="context-menu-item" :style="{ color: sortMode === 'date_asc' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="sortMode = 'date_asc'; sortDropdownOpen = false">
                  Oldest
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" :style="{ color: sortMode === 'alpha_asc' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="sortMode = 'alpha_asc'; sortDropdownOpen = false">
                  Name (A-Z)
                </div>
                <div class="context-menu-item" :style="{ color: sortMode === 'alpha_desc' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="sortMode = 'alpha_desc'; sortDropdownOpen = false">
                  Name (Z-A)
                </div>
              </div>
            </div>

            <!-- View Mode Toggles -->
            <div class="view-toggle-container">
              <div class="custom-tooltip-container" data-tooltip="Comfy View">
                <button class="btn btn-view-toggle" :class="{ active: viewMode === 'comfy' }" @click="viewMode = 'comfy'">
                  <span class="material-symbols-outlined" style="font-size:20px;">grid_view</span>
                </button>
              </div>
              <div class="custom-tooltip-container" data-tooltip="Compact View">
                <button class="btn btn-view-toggle" :class="{ active: viewMode === 'compact' }" @click="viewMode = 'compact'">
                  <span class="material-symbols-outlined" style="font-size:20px;">view_list</span>
                </button>
              </div>
            </div>

            <div id="cm-action-bar" v-if="store.selectionMode && store.selectedItemIds.size > 0" class="cm-action-bar">
              <span class="cm-action-bar-text">{{ t('cm.selected', { count: store.selectedItemIds.size }) }}</span>
              <button id="btn-enable-selected" class="btn btn-action custom-tooltip-container" :data-tooltip="t('context.enable')" @click="enableSelected(true)">
                <span class="material-symbols-outlined" style="font-size:18px;">check_circle</span>
              </button>
              <button id="btn-disable-selected" class="btn btn-action custom-tooltip-container" :data-tooltip="t('context.disable')" @click="enableSelected(false)">
                <span class="material-symbols-outlined" style="font-size:18px;">block</span>
              </button>
              <button id="btn-retag-selected" class="btn btn-action custom-tooltip-container" :data-tooltip="t('context.retag')" @click="onRetagItem()">
                <span class="material-symbols-outlined" style="font-size:18px;">sell</span>
              </button>
              <button id="btn-tags-selected" class="btn btn-action custom-tooltip-container" :data-tooltip="t('context.user_tags')" @click="onEditTags()">
                <span class="material-symbols-outlined" style="font-size:18px;">label</span>
              </button>
              <button id="btn-move-selected" class="btn btn-action custom-tooltip-container" :data-tooltip="t('modal.move')" @click="moveSelected">
                <span class="material-symbols-outlined" style="font-size:18px;">drive_file_move</span>
              </button>
              <button id="btn-delete-selected" class="btn btn-action btn-danger-outline custom-tooltip-container" :data-tooltip="t('modal.delete')" @click="deleteSelected">
                <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
              </button>
            </div>
            <button v-if="store.selectionMode" id="btn-select-all" class="btn btn-action mr-2" @click="toggleSelectAll">
              {{ store.selectedItemIds.size === filteredItems.length && filteredItems.length > 0 ? 'Deselect All' : 'Select All' }}
            </button>
            <button id="btn-toggle-select" class="btn btn-select-toggle" :class="{ active: store.selectionMode }" @click="toggleSelectionMode">
              {{ store.selectionMode ? 'Done' : 'Manual Select' }}
            </button>
          </div>
        </div>

        <div :class="viewMode === 'comfy' ? 'cm-items-grid' : 'cm-items-list'" id="cm-items-grid" ref="gridRef" @click.self="clearSelection">
          <div v-if="loadingItems" class="text-muted-padded col-span-full">Loading Items...</div>
          <div v-else-if="filteredItems.length === 0" class="text-muted-padded col-span-full">No items found in this set.</div>
          <ItemCard
            v-else
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
            :selected="store.selectedItemIds.has(item.id)"
            :selectionMode="store.selectionMode"
            :viewMode="viewMode"
            @select="onItemClick"
            @dragstart="onItemDragStart($event, item.id)"
            @dragend="onItemDragEnd"
            @contextmenu.prevent="onItemContextMenu($event, item)"
            @rename="onRenameItem"
          />
        </div>
      </div>

      <!-- Filter Sidebar -->
      <div class="cm-filter-sidebar">
        <div class="cm-sidebar-header">Filters</div>

        <div class="filter-group">
          <div class="search-container">
            <span class="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              v-model="searchQuery"
              class="search-input"
              :placeholder="t('cm.search_placeholder')"
              @focus="isSearchFocused = true"
              @blur="onSearchBlur"
              @keydown.enter="addSearchHistory(searchQuery)"
            />
            <span v-if="searchQuery" class="material-symbols-outlined search-clear-icon" @click="searchQuery = ''">close</span>

            <!-- Autocomplete & Search History Dropdown -->
            <div v-if="isSearchFocused && (filteredTagSuggestions.length > 0 || searchHistory.length > 0)" class="search-autocomplete-dropdown">
              <template v-if="filteredTagSuggestions.length > 0">
                <div class="search-autocomplete-section">{{ t('cm.user_tags') }}</div>
                <div v-for="tag in filteredTagSuggestions" :key="'tag-' + tag" class="search-autocomplete-item" @mousedown.prevent="selectSearchSuggestion(tag)">
                  <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary);">label</span>
                  <span>{{ tag }}</span>
                </div>
              </template>

              <template v-if="searchHistory.length > 0 && !searchQuery">
                <div class="search-autocomplete-section" style="margin-top: 0.25rem;">{{ t('cm.recent_searches') }}</div>
                <div v-for="item in searchHistory" :key="'hist-' + item" class="search-autocomplete-item" @mousedown.prevent="selectSearchSuggestion(item)">
                  <span class="material-symbols-outlined" style="font-size: 16px; color: var(--text-muted);">history</span>
                  <span style="flex: 1;">{{ item }}</span>
                  <span class="material-symbols-outlined" style="font-size: 14px; color: var(--text-muted);" @click.stop="removeSearchHistory(item)">close</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Type</label>
          <div class="flex-col gap-2">
            <button class="btn filter-btn" :class="{ active: filterTypeCAS }" @click="filterTypeCAS = !filterTypeCAS">
              <span class="material-symbols-outlined mr-2">checkroom</span>
              CAS Items
            </button>

            <div v-if="filterTypeCAS" class="cas-categories-container">
              <button
                v-for="cat in casCategoriesList"
                :key="cat"
                class="cas-category-pill"
                :class="{ active: activeCasCategories.has(cat) }"
                @click="toggleCasCategory(cat)"
              >
                <span v-if="casCategoryIcons[cat]" class="material-symbols-outlined mr-1" style="font-size: 16px;">
                  {{ casCategoryIcons[cat] }}
                </span>
                {{ cat }}
              </button>
            </div>

            <button class="btn filter-btn" :class="{ active: filterTypeBuildBuy }" @click="filterTypeBuildBuy = !filterTypeBuildBuy">
              <span class="material-symbols-outlined mr-2">chair</span>
              Build-Buy Items
            </button>
            <button class="btn filter-btn" :class="{ active: filterTypeOther }" @click="filterTypeOther = !filterTypeOther">
              <span class="material-symbols-outlined mr-2">inventory_2</span>
              Other Items
            </button>
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Mode</label>
          <div class="flex-col gap-2">
            <button class="btn filter-btn" :class="{ active: filterModeEnabled }" @click="filterModeEnabled = !filterModeEnabled">
              <span class="material-symbols-outlined mr-2">check_box</span>
              Enabled
            </button>
            <button class="btn filter-btn" :class="{ active: filterModeDisabled }" @click="filterModeDisabled = !filterModeDisabled">
              <span class="material-symbols-outlined mr-2">disabled_by_default</span>
              Disabled
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { fetchSets, fetchItems, createSet as createSetApi, renameSet, deleteSet, moveItems, moveSet, deleteItems, setItemEnabled, renameItemApi, importFiles, uploadFiles } from '@/api/client'
import { useModal } from '@/composables/useModal'
import { useToast } from '@/composables/useToast'
import { useSelection } from '@/composables/useSelection'
import { useContextMenu } from '@/composables/useContextMenu'
import { useAppStore } from '@/stores/app'
import type { SetEntity, ItemEntity } from '@/types'
import SetTreeNode from '@/components/SetTreeNode.vue'
import ItemCard from '@/components/ItemCard.vue'

const viewMode = ref(localStorage.getItem('viewMode') || 'comfy')
watch(viewMode, (v) => {
  localStorage.setItem('viewMode', v)
})

const sortMode = ref(localStorage.getItem('sortMode') || 'date_desc')
watch(sortMode, (v) => {
  localStorage.setItem('sortMode', v)
})
const sortDropdownOpen = ref(false)

const closeDropdown = () => {
  if (sortDropdownOpen.value) sortDropdownOpen.value = false
}

const { showPrompt, showConfirm, showDeleteSet, showDeleteItems, showSelectSet } = useModal()
const { showContextMenu } = useContextMenu()
const { showToast } = useToast()
const store = useAppStore()

const allSets = ref<SetEntity[]>([])
const allItems = ref<ItemEntity[]>([])
const loadingSets = ref(true)
const loadingItems = ref(true)

const isDragOverAll = ref(false)

const gridRef = ref<HTMLElement | null>(null)
const { initSelection, destroySelection, isDraggingSelection } = useSelection()

const rootSets = computed(() => allSets.value.filter(s => !s.parentSetsEntityId))

const searchQuery = ref('')
const filterTypeCAS = ref(true)
const filterTypeBuildBuy = ref(true)
const filterTypeOther = ref(true)

const casCategoriesList = ['Hair', 'Full body', 'Tops', 'Bottoms', 'Shoes', 'Details', 'Skins', 'Accessories', 'Sliders', 'Presets', 'Other']

const casCategoryIcons: Record<string, string> = {
  'Hair': 'face',
  'Full body': 'accessibility_new',
  'Tops': 'apparel',
  'Bottoms': 'airline_seat_legroom_extra',
  'Shoes': 'steps',
  'Details': 'health_and_beauty',
  'Skins': 'palette',
  'Accessories': 'diamond',
  'Sliders': 'tune',
  'Presets': 'auto_awesome',
  'Other': 'more_horiz'
}

const activeCasCategories = ref(new Set(casCategoriesList))

const toggleCasCategory = (cat: string) => {
  if (activeCasCategories.value.has(cat)) {
    activeCasCategories.value.delete(cat)
  } else {
    activeCasCategories.value.add(cat)
  }
}

const filterModeEnabled = ref(true)
const filterModeDisabled = ref(true)

const filteredItems = computed(() => {
  let items = allItems.value

  // Set filter
  if (store.selectedSetId !== null) {
    items = items.filter(i => i.setsEntityId === store.selectedSetId)
  }

  // Name filter
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    items = items.filter(i => i.fileName.toLowerCase().includes(q))
  }

  // Mode filter
  if (!filterModeEnabled.value) items = items.filter(i => !i.enabled)
  if (!filterModeDisabled.value) items = items.filter(i => i.enabled)

  // Type filter
  items = items.filter(i => {
    const pt = i.packageType || ''
    const isCAS = pt === 'CAS' || pt === 'Sim'
    const isBuildBuy = pt === 'BuildBuy' || pt === 'Lot'
    const isOther = !isCAS && !isBuildBuy

    if (isCAS && filterTypeCAS.value) {
      if (!i.casCategories) return true
      const cats = i.casCategories.split(',').map(c => c.trim())
      return cats.some(c => activeCasCategories.value.has(c))
    }
    if (isBuildBuy && filterTypeBuildBuy.value) return true
    if (isOther && filterTypeOther.value) return true

    return false
  })

  // Sort logic
  items.sort((a, b) => {
    switch (sortMode.value) {
      case 'date_asc': return a.id - b.id
      case 'date_desc': return b.id - a.id
      case 'alpha_asc': return a.fileName.localeCompare(b.fileName)
      case 'alpha_desc': return b.fileName.localeCompare(a.fileName)
      default: return 0
    }
  })

  return items
})

const totalSize = computed(() => filteredItems.value.reduce((acc, curr) => acc + curr.fileSize, 0))

const formatSize = (kb: number) => {
  if (kb < 1024) return kb.toFixed(2) + ' KB'
  const mb = kb / 1024
  if (mb < 1024) return mb.toFixed(2) + ' MB'
  const gb = mb / 1024
  return gb.toFixed(2) + ' GB'
}

const currentSetName = computed(() => {
  if (store.selectedSetId === null) return 'All Items'
  const s = allSets.value.find(set => set.id === store.selectedSetId)
  return s ? s.name : 'Items'
})

const loadData = async () => {
  try {
    const setsPromise = fetchSets().then(setsRes => {
      allSets.value = setsRes
      store.isDirty = allSets.value.some(s => s.dirty)
      loadingSets.value = false
    })

    const itemsPromise = fetchItems().then(itemsRes => {
      allItems.value = itemsRes
      loadingItems.value = false
    })

    await Promise.all([setsPromise, itemsPromise])
  } catch (err) {
    showToast('Failed to load Content Manager data.', 'error')
    loadingSets.value = false
    loadingItems.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    store.selectedItemIds.clear()
    if (store.selectionMode) {
      store.selectionMode = false
    }
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
    if (tag !== 'input' && tag !== 'textarea') {
      e.preventDefault()
      if (!store.selectionMode) {
        store.selectionMode = true
      }
      filteredItems.value.forEach(item => store.selectedItemIds.add(item.id))
    }
  }
}

const toggleSelectAll = () => {
  if (store.selectedItemIds.size === filteredItems.value.length && filteredItems.value.length > 0) {
    store.selectedItemIds.clear()
  } else {
    filteredItems.value.forEach(item => store.selectedItemIds.add(item.id))
  }
}

onMounted(() => {
  loadData()
  initSelection('#cm-items-grid')
  document.addEventListener('click', closeDropdown)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  destroySelection()
  document.removeEventListener('click', closeDropdown)
  document.removeEventListener('keydown', handleKeydown)
})

const clearSelection = () => {
  if (isDraggingSelection.value || isDraggingItem.value) return;
  store.selectedItemIds.clear()
}

const selectSet = (id: number | null) => {
  store.selectedSetId = id
}

const createSet = async () => {
  const name = await showPrompt('Enter new set name:')
  if (!name || name.trim() === '') return
  try {
    await createSetApi(name.trim(), store.selectedSetId)
    showToast('Set created successfully.', 'success')
    if (store.selectedSetId) store.expandedSets.add(store.selectedSetId)
    await loadData()
  } catch (e) {
    showToast('Failed to create set.', 'error')
  }
}

const toggleSelectionMode = () => {
  store.selectionMode = !store.selectionMode
  if (!store.selectionMode) store.selectedItemIds.clear()
}

const lastClickedItemId = ref<number | null>(null);
const isDraggingItem = ref(false);

const onItemClick = (e: MouseEvent, id: number) => {
  if (isDraggingSelection.value || isDraggingItem.value) return;

  if (e.shiftKey && lastClickedItemId.value !== null) {
    const items = filteredItems.value;
    const lastIdx = items.findIndex(i => i.id === lastClickedItemId.value);
    const currIdx = items.findIndex(i => i.id === id);

    if (lastIdx !== -1 && currIdx !== -1) {
      const start = Math.min(lastIdx, currIdx);
      const end = Math.max(lastIdx, currIdx);

      for (let i = start; i <= end; i++) {
        store.selectedItemIds.add(items[i].id);
      }
      return;
    }
  }

  if (store.selectionMode) {
    if (store.selectedItemIds.has(id)) store.selectedItemIds.delete(id)
    else store.selectedItemIds.add(id)
  } else {
    if (e.ctrlKey || e.metaKey) {
      if (store.selectedItemIds.has(id)) store.selectedItemIds.delete(id)
      else store.selectedItemIds.add(id)
    } else {
      store.selectedItemIds.clear()
      store.selectedItemIds.add(id)
    }
  }

  lastClickedItemId.value = id;
}

const onItemDragStart = (e: DragEvent, id: number) => {
  isDraggingItem.value = true;
  if (!store.selectedItemIds.has(id)) {
    store.selectedItemIds.clear()
    store.selectedItemIds.add(id)
  }
  e.dataTransfer!.setData('application/json', JSON.stringify({ type: 'items', ids: Array.from(store.selectedItemIds) }))
}

const onItemDragEnd = () => {
  setTimeout(() => {
    isDraggingItem.value = false;
  }, 150);
}

const moveSelected = async () => {
  if (store.selectedItemIds.size === 0) return
  const targetSetId = await showSelectSet(allSets.value)
  if (targetSetId === 'cancelled') return

  try {
    await moveItems(Array.from(store.selectedItemIds), targetSetId)
    showToast(`Moved ${store.selectedItemIds.size} items.`, 'success')
    store.selectedItemIds.clear()
    store.selectionMode = false
    await loadData()
  } catch (e) {
    showToast('Failed to move items.', 'error')
  }
}

const deleteSelected = async () => {
  const result = await showDeleteItems(`Are you sure you want to delete these ${store.selectedItemIds.size} items?`)
  if (result && result.confirmed) {
    try {
      const ids = Array.from(store.selectedItemIds)
      await deleteItems(ids, result.permanent)
      showToast(`Successfully deleted ${ids.length} items.`, 'success')
      store.selectedItemIds.clear()
      await loadData()
    } catch (e) {
      showToast('Failed to delete items.', 'error')
    }
  }
}

const onSidebarContextMenu = (e: MouseEvent) => {
  showContextMenu(e.pageX, e.pageY, [
    {
      label: 'Add Set', icon: 'add', action: async () => {
        const name = await showPrompt('Enter new set name:')
        if (!name || name.trim() === '') return
        try {
          await createSetApi(name.trim(), null)
          await loadData()
        } catch (e) {
          showToast('Failed to create set.', 'error')
        }
      }
    }
  ])
}

const onSetContextMenu = (e: MouseEvent, set: SetEntity) => {
  const isBuiltIn = set.name === 'Default' || set.name === 'Legacy'
  const menuItems = [
    {
      label: 'Add Sub-Set', icon: 'add', action: async () => {
        const name = await showPrompt('Enter sub-set name:')
        if (!name || name.trim() === '') return
        try {
          await createSetApi(name.trim(), set.id)
          store.expandedSets.add(set.id)
          await loadData()
        } catch (e) {
          showToast('Failed to create sub-set.', 'error')
        }
      }
    }
  ]

  if (!isBuiltIn) {
    menuItems.push(
      {
        label: 'Rename', icon: 'edit', action: async () => {
          const newName = await showPrompt(`Rename '${set.name}':`)
          if (!newName || newName.trim() === '') return
          try {
            await renameSet(set.id, newName.trim())
            await loadData()
          } catch (e) {
            showToast('Failed to rename set.', 'error')
          }
        }
      },
      { divider: true, label: '' },
      {
        label: 'Delete Set', icon: 'delete', danger: true, action: async () => {
          const result = await showDeleteSet(set.name)
          if (result && result.confirmed) {
            try {
              await deleteSet(set.id, result.deletePhysical)
              if (store.selectedSetId === set.id) store.selectedSetId = null
              showToast('Set deleted.', 'success')
              await loadData()
            } catch (e: any) {
              showToast(e.message || 'Failed to delete set.', 'error')
            }
          }
        }
      }
    )
  }
  showContextMenu(e.pageX, e.pageY, menuItems)
}

const onItemContextMenu = (e: MouseEvent, item: ItemEntity) => {
  const isSelected = store.selectedItemIds.has(item.id)
  const targetIds = isSelected ? Array.from(store.selectedItemIds) : [item.id]

  const menuItems = [
    {
      label: isSelected && targetIds.length > 1 ? (item.enabled ? `Disable ${targetIds.length} Items` : `Enable ${targetIds.length} Items`) : (item.enabled ? 'Disable' : 'Enable'),
      icon: item.enabled ? 'block' : 'check_circle',
      action: async () => {
        try {
          await setItemEnabled(targetIds, !item.enabled)
          targetIds.forEach(id => {
            const target = allItems.value.find(i => i.id === id)
            if (target) target.enabled = !item.enabled
          })
          store.isDirty = true
          showToast(targetIds.length > 1 ? `Toggled ${targetIds.length} items.` : (item.enabled ? 'Item disabled.' : 'Item enabled.'), 'success')
        } catch (e) {
          showToast('Failed to toggle item(s).', 'error')
        }
      }
    },
    {
      label: isSelected && targetIds.length > 1 ? `Delete ${targetIds.length} Items` : 'Delete',
      icon: 'delete',
      danger: true,
      action: async () => {
        const result = await showDeleteItems(`Are you sure you want to delete ${targetIds.length > 1 ? `these ${targetIds.length} items` : 'this item'}?`)
        if (result && result.confirmed) {
          try {
            await deleteItems(targetIds, result.permanent)
            allItems.value = allItems.value.filter(i => !targetIds.includes(i.id))
            if (isSelected) store.selectedItemIds.clear()
            showToast(`Deleted ${targetIds.length} item(s).`, 'success')
          } catch (e) {
            showToast('Failed to delete item(s).', 'error')
          }
        }
      }
    }
  ]
  showContextMenu(e.pageX, e.pageY, menuItems)
}

const enableSelected = async (enabled: boolean) => {
  const ids = Array.from(store.selectedItemIds)
  if (ids.length === 0) return
  try {
    await setItemEnabled(ids, enabled)
    ids.forEach(id => {
      const item = allItems.value.find(i => i.id === id)
      if (item) item.enabled = enabled
    })
    store.isDirty = true
    showToast(`Successfully ${enabled ? 'enabled' : 'disabled'} ${ids.length} items.`, 'success')
    toggleSelectionMode()
  } catch (e) {
    showToast('Failed to toggle items.', 'error')
  }
}

const onDropAll = async (e: DragEvent) => {
  isDragOverAll.value = false
  const data = JSON.parse(e.dataTransfer!.getData('application/json') || '{}')
  if (!data.type) return

  if (data.type === 'items') {
    const itemIds = data.ids
    if (!itemIds || itemIds.length === 0) return
    try {
      const defaultSet = allSets.value.find(s => s.name === 'Default')
      await moveItems(itemIds, defaultSet ? defaultSet.id : null)
      showToast(`Moved ${itemIds.length} item(s) to ${defaultSet ? 'Default' : 'All Items'}.`, 'success')
      store.selectedItemIds.clear()
      store.selectionMode = false
      await loadData()
    } catch (e) {
      showToast('Failed to move items.', 'error')
    }
  } else if (data.type === 'set') {
    try {
      await moveSet(data.id, null)
      showToast('Moved set.', 'success')
      await loadData()
    } catch (e) {
      showToast('Failed to move set.', 'error')
    }
  }
}

const onDropSet = async (data: any, targetSetId: number) => {
  if (!data || !data.type) return

  if (data.type === 'items') {
    const itemIds = data.ids
    if (!itemIds || itemIds.length === 0) return
    try {
      await moveItems(itemIds, targetSetId)
      showToast(`Moved ${itemIds.length} item(s).`, 'success')
      store.selectedItemIds.clear()
      store.selectionMode = false
      await loadData()
    } catch (e) {
      showToast('Failed to move items.', 'error')
    }
  } else if (data.type === 'set') {
    if (data.id === targetSetId) return
    try {
      await moveSet(data.id, targetSetId)
      showToast('Moved set.', 'success')
      store.expandedSets.add(targetSetId)
      await loadData()
    } catch (e) {
      showToast('Failed to move set.', 'error')
    }
  }
}

const onRenameItem = async (itemId: number) => {
  const item = allItems.value.find(i => i.id === itemId)
  if (!item) return

  // extract the file extension from completeFileName
  const parts = item.completeFileName.split('.')
  const extension = parts.length > 1 ? '.' + parts.pop() : ''

  // strip extension from the current fileName for the prompt
  let currentName = item.fileName
  if (extension && currentName.toLowerCase().endsWith(extension.toLowerCase())) {
    currentName = currentName.substring(0, currentName.length - extension.length)
  }

  const newName = await showPrompt('Rename Item', 'Enter a new name for the item:', currentName)
  if (newName && newName.trim() !== currentName) {
    try {
      await renameItemApi(itemId, newName.trim())
      showToast('Item renamed successfully.', 'success')
      await loadData()
    } catch (err: any) {
      showToast(err.message || 'Failed to rename item.', 'error')
    }
  }
}
// ===== Drag and Drop Import =====
const isDraggingFiles = ref(false)
const dragCounter = ref(0)

const onDragEnter = (e: DragEvent) => {
  if (!e.dataTransfer?.types?.includes('Files')) return
  e.preventDefault()
  dragCounter.value++
  if (dragCounter.value === 1) isDraggingFiles.value = true
}

const onDragLeave = (e: DragEvent) => {
  if (!e.dataTransfer?.types?.includes('Files')) return
  e.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) isDraggingFiles.value = false
}

const onDragOver = (e: DragEvent) => {
  if (!e.dataTransfer?.types?.includes('Files')) return
  e.preventDefault()
}

const onDropFiles = async (e: DragEvent) => {
  if (!e.dataTransfer?.types?.includes('Files')) return
  e.preventDefault()
  dragCounter.value = 0
  isDraggingFiles.value = false

  if (!e.dataTransfer?.files?.length) return

  const files = Array.from(e.dataTransfer.files)
  const validExts = ['.package', '.sims3pack']
  const validFiles = files.filter(f => {
    const lower = f.name.toLowerCase()
    return validExts.some(ext => lower.endsWith(ext))
  })

  if (validFiles.length === 0) {
    const debugNames = files.map(f => f.name).join(', ')
    showToast(`Failed to import. Names: [${debugNames}]`, 'error')
    return
  }

  try {
    showToast(`Importing ${validFiles.length} file(s)...`, 'info')
    const res = await uploadFiles(validFiles)
    // Read the stream to wait for completion (optional to show progress, but at least wait for DONE)
    const reader = res.body?.getReader()
    if (reader) {
      const decoder = new TextDecoder()
      while (true) {
        const { done } = await reader.read()
        if (done) break
      }
    }
    showToast('Import completed successfully!', 'success')
    loadData()
  } catch (err: any) {
    showToast(err.message || 'Failed to import files', 'error')
  }
}
</script>
