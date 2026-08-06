<template>
  <div class="tree-item selectable-card" :class="{ active: isActive, selected: isSelected, 'drag-over': isDragOver, 'is-builtin': isBuiltIn }"
       :data-id="set.id"
       :data-builtin="isBuiltIn ? 'true' : 'false'"
       :style="{ paddingLeft: `${0.5 + (depth * 1.5)}rem` }"
       :draggable="!isBuiltIn && isSelected"
       @click.stop="selectNode"
       @contextmenu.prevent.stop="handleContextMenu"
       @dragstart.stop="onDragStart"
       @dragend.stop="onDragEnd"
       @dragover.prevent.stop="onDragOver"
       @dragleave.stop="onDragLeave"
       @drop.prevent.stop="onDrop">

    <span class="tree-label" :draggable="!isBuiltIn" @dragstart.stop="onDragStart" @dragend.stop="onDragEnd">
      <span class="tree-icon material-symbols-outlined">sell</span>
      {{ set.name }}
    </span>
    <span class="caret" :class="{ expanded: isExpanded }" @click.stop="toggleExpand">
      {{ hasChildren ? '▶' : '' }}
    </span>
  </div>

  <template v-if="isExpanded">
    <SetTreeNode v-for="child in children" :key="child.id"
                 :set="child" :depth="depth + 1" :all-sets="allSets"
                 @select="$emit('select', $event)"
                 @context-menu="(e, s) => $emit('context-menu', e, s)"
                 @drop="(data, id) => $emit('drop', data, id)" />
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAppStore } from '@/stores/app';
import type { SetEntity } from '@/types';
import { moveItems } from '@/api/client';

const props = defineProps<{
  set: SetEntity;
  depth: number;
  allSets: SetEntity[];
}>();

const emit = defineEmits<{
  (e: 'select', setId: number): void;
  (e: 'context-menu', event: MouseEvent, set: SetEntity): void;
  (e: 'drop', data: any, targetSetId: number): void;
}>();

const store = useAppStore();
const isDragOver = ref(false);

const isBuiltIn = computed(() => props.set.name === 'Default' || props.set.name === 'Legacy');
const children = computed(() => props.allSets.filter(s => s.parentSetsEntityId === props.set.id));
const hasChildren = computed(() => children.value.length > 0);
const isExpanded = computed(() => store.expandedSets.has(props.set.id));
const isActive = computed(() => store.selectedSetId === props.set.id);
const isSelected = computed(() => !isBuiltIn.value && store.selectedSetIds.has(props.set.id));

function toggleExpand() {
  if (isExpanded.value) {
    store.expandedSets.delete(props.set.id);
  } else {
    store.expandedSets.add(props.set.id);
  }
}

function selectNode(e: MouseEvent) {
  if (!isBuiltIn.value) {
    if (e.ctrlKey || e.metaKey) {
      if (store.selectedSetIds.has(props.set.id)) {
        store.selectedSetIds.delete(props.set.id);
      } else {
        store.selectedSetIds.add(props.set.id);
      }
    } else if (e.shiftKey) {
      store.selectedSetIds.add(props.set.id);
    } else {
      if (!store.selectedSetIds.has(props.set.id) || store.selectedSetIds.size <= 1) {
        store.selectedSetIds.clear();
        store.selectedSetIds.add(props.set.id);
      }
    }
  } else {
    // Built-in sets like Default cannot be multi-selected
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      store.selectedSetIds.clear();
    }
  }
  store.selectedSetId = props.set.id;
  emit('select', props.set.id);
}

function handleContextMenu(e: MouseEvent) {
  emit('context-menu', e, props.set);
}

function onDragStart(e: DragEvent) {
  if (isBuiltIn.value) {
    e.preventDefault();
    return;
  }

  if (e.dataTransfer) {
    let idsToDrag = Array.from(store.selectedSetIds).filter(id => {
      const s = props.allSets.find(x => x.id === id);
      return s && s.name !== 'Default' && s.name !== 'Legacy';
    });
    if (!idsToDrag.includes(props.set.id)) {
      idsToDrag.push(props.set.id);
    }
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'sets', id: props.set.id, ids: idsToDrag }));
    (e.target as HTMLElement).style.opacity = '0.5';
  }
}

function onDragEnd(e: DragEvent) {
  (e.target as HTMLElement).style.opacity = '1';
}

function onDragOver() {
  isDragOver.value = true;
}

function onDragLeave() {
  isDragOver.value = false;
}

async function onDrop(e: DragEvent) {
  isDragOver.value = false;
  if (!e.dataTransfer) return;
  const dataStr = e.dataTransfer.getData('application/json');
  if (!dataStr) return;

  try {
    const data = JSON.parse(dataStr);
    emit('drop', data, props.set.id);
  } catch (err) {}
}
</script>
