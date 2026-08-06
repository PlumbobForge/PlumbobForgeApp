import { reactive } from 'vue';

const confirmState = reactive({ visible: false, title: '', message: '', confirmText: '', cancelText: '', danger: false, resolve: null as ((val: boolean) => void) | null });
const promptState = reactive({ visible: false, title: '', message: '', defaultValue: '', resolve: null as ((val: string | null) => void) | null });
const deleteState = reactive({ visible: false, setName: '', resolve: null as ((val: { confirmed: boolean, deletePhysical: boolean } | null) => void) | null });
const deleteItemsState = reactive({ visible: false, message: '', resolve: null as ((val: { confirmed: boolean, permanent: boolean } | null) => void) | null });
const selectSetState = reactive({ visible: false, sets: [] as any[], resolve: null as ((val: number | null | 'cancelled') => void) | null });
const progressState = reactive({ visible: false, title: '', log: [] as string[], timer: '00:00', status: 'Running...', running: false });

const retagState = reactive({ visible: false, packageType: 'CAS', casCategories: [] as string[], resolve: null as ((val: { confirmed: boolean, packageType: string, casCategories: string } | null) => void) | null });
const recheckState = reactive({ visible: false, skipUserTagged: true, resolve: null as ((val: { confirmed: boolean, skipUserTagged: boolean } | null) => void) | null });
const userTagsState = reactive({ visible: false, itemIds: [] as number[], initialTags: [] as string[], hasDifferentTags: false, resolve: null as ((val: { confirmed: boolean, setTags?: string[], addTags?: string[], removeAll?: boolean } | null) => void) | null });
const duplicateImportState = reactive({ visible: false, duplicateFiles: [] as string[], resolve: null as ((action: 'rename' | 'skip' | 'replace' | null) => void) | null });

export function useModal() {
  function showConfirm(title: string, message: string, options?: { confirmText?: string, cancelText?: string, danger?: boolean }): Promise<boolean> {
    return new Promise(resolve => {
      confirmState.title = title;
      confirmState.message = message;
      confirmState.confirmText = options?.confirmText || '';
      confirmState.cancelText = options?.cancelText || '';
      confirmState.danger = options?.danger || false;
      confirmState.resolve = resolve;
      confirmState.visible = true;
    });
  }

  function showPrompt(title: string, message: string = '', defaultValue: string = ''): Promise<string | null> {
    return new Promise(resolve => {
      promptState.title = title;
      promptState.message = message;
      promptState.defaultValue = defaultValue;
      promptState.resolve = resolve;
      promptState.visible = true;
    });
  }

  function showDeleteSet(setName: string): Promise<{ confirmed: boolean, deletePhysical: boolean } | null> {
    return new Promise(resolve => {
      deleteState.setName = setName;
      deleteState.resolve = resolve;
      deleteState.visible = true;
    });
  }

  function showDeleteItems(message: string): Promise<{ confirmed: boolean, permanent: boolean } | null> {
    return new Promise(resolve => {
      deleteItemsState.message = message;
      deleteItemsState.resolve = resolve;
      deleteItemsState.visible = true;
    });
  }

  function showSelectSet(sets: any[]): Promise<number | null | 'cancelled'> {
    return new Promise(resolve => {
      selectSetState.sets = sets;
      selectSetState.resolve = resolve;
      selectSetState.visible = true;
    });
  }

  function showRetag(initialPackageType: string = 'CAS', initialCasCategories: string = ''): Promise<{ confirmed: boolean, packageType: string, casCategories: string } | null> {
    return new Promise(resolve => {
      retagState.packageType = initialPackageType || 'CAS';
      retagState.casCategories = initialCasCategories ? initialCasCategories.split(',').map(s => s.trim()).filter(Boolean) : [];
      retagState.resolve = resolve;
      retagState.visible = true;
    });
  }

  function showRecheckConfirm(): Promise<{ confirmed: boolean, skipUserTagged: boolean } | null> {
    return new Promise(resolve => {
      recheckState.skipUserTagged = true;
      recheckState.resolve = resolve;
      recheckState.visible = true;
    });
  }

  function showUserTagsModal(itemIds: number[], initialTags: string[], hasDifferentTags: boolean = false): Promise<{ confirmed: boolean, setTags?: string[], addTags?: string[], removeAll?: boolean } | null> {
    return new Promise(resolve => {
      userTagsState.itemIds = itemIds;
      userTagsState.initialTags = initialTags;
      userTagsState.hasDifferentTags = hasDifferentTags;
      userTagsState.resolve = resolve;
      userTagsState.visible = true;
    });
  }

  function showDuplicateImportModal(duplicateFiles: string[]): Promise<'rename' | 'skip' | 'replace' | null> {
    return new Promise(resolve => {
      duplicateImportState.duplicateFiles = duplicateFiles;
      duplicateImportState.resolve = resolve;
      duplicateImportState.visible = true;
    });
  }

  function showProgress(title: string = 'Working...') {
    progressState.title = title;
    progressState.visible = true;
    progressState.log = [];
    progressState.timer = '00:00';
    progressState.status = 'Running...';
    progressState.running = true;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      progressState.timer = `${m}:${s}`;
    }, 1000);

    return {
      appendLog(msg: string) {
        progressState.log.push(msg);
      },
      finish(success: boolean) {
        clearInterval(interval);
        progressState.running = false;
        progressState.status = success ? 'Completed' : 'Failed';
      },
      onClose(_cb: () => void) {
        // Callback functionality if needed
      }
    };
  }

  return {
    confirmState,
    promptState,
    deleteState,
    deleteItemsState,
    selectSetState,
    retagState,
    recheckState,
    userTagsState,
    duplicateImportState,
    progressState,
    showConfirm,
    showPrompt,
    showDeleteSet,
    showDeleteItems,
    showSelectSet,
    showRetag,
    showRecheckConfirm,
    showUserTagsModal,
    showDuplicateImportModal,
    showProgress
  };
}
