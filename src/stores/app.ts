import { reactive } from 'vue';
import type { SetEntity, ItemEntity, Configuration } from '@/types';

export const store = reactive({
  sets: [] as SetEntity[],
  setsCache: [] as SetEntity[],
  items: [] as ItemEntity[],
  configs: [] as Configuration[],
  selectedSetId: null as number | null,
  selectedSetIds: new Set<number>(),
  expandedSets: new Set<number>(),
  selectedItemIds: new Set<number>(),
  selectionMode: false,
  currentConfig: null as Configuration | null,
  isDirty: false,
  cacheMethod: 'Dynamic' as string,
  appVersion: '',
  updateStatus: 'idle' as 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error',
  downloadPercent: 0,
  lastImportedAt: 0,
});

export function useAppStore() {
  return store;
}
