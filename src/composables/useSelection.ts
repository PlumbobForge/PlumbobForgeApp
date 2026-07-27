import { ref } from 'vue';
import { useAppStore } from '@/stores/app';

export function useSelection() {
  const store = useAppStore();
  const isDraggingSelection = ref(false);

  let containerElement: HTMLElement | null = null;
  let selectionBox: HTMLElement | null = null;
  
  let startX = 0;
  let startY = 0;
  let isPointerDown = false;
  
  let dragBaseSelection = new Set<number>();
  let dragMode: 'replace' | 'toggle' = 'replace';
  
  let animationFrameId: number | null = null;

  const onPointerDown = (e: MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    
    const target = e.target as HTMLElement;
    // Don't start drag on interactive elements or item cards
    if (target.closest('button, input, .context-menu, .comfy-info-btn, .item-actions, .item-card')) return;
    // Don't start drag on the scrollbar (approx check by ensuring target is not the container scrollbar area)
    if (containerElement && target === containerElement) {
       if (e.offsetX > containerElement.clientWidth || e.offsetY > containerElement.clientHeight) return;
    }

    isPointerDown = true;
    startX = e.clientX;
    startY = e.clientY;
    
    if (store.selectionMode || e.ctrlKey || e.metaKey || e.shiftKey) {
      dragMode = 'toggle';
      dragBaseSelection = new Set(store.selectedItemIds);
    } else {
      dragMode = 'replace';
      dragBaseSelection = new Set();
    }
  };

  const onPointerMove = (e: MouseEvent) => {
    if (!isPointerDown) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    if (!isDraggingSelection.value && Math.sqrt(dx*dx + dy*dy) > 4) {
      isDraggingSelection.value = true;
      
      if (dragMode === 'replace') {
        store.selectedItemIds.clear();
      }
      
      selectionBox = document.createElement('div');
      selectionBox.className = 'selection-area';
      selectionBox.style.position = 'fixed';
      selectionBox.style.zIndex = '9999';
      selectionBox.style.pointerEvents = 'none';
      document.body.appendChild(selectionBox);
    }
    
    if (isDraggingSelection.value && selectionBox) {
      const left = Math.min(e.clientX, startX);
      const top = Math.min(e.clientY, startY);
      const width = Math.abs(e.clientX - startX);
      const height = Math.abs(e.clientY - startY);
      
      selectionBox.style.left = `${left}px`;
      selectionBox.style.top = `${top}px`;
      selectionBox.style.width = `${width}px`;
      selectionBox.style.height = `${height}px`;
      
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(() => {
          checkIntersections({ left, top, right: left + width, bottom: top + height });
          animationFrameId = null;
        });
      }
    }
  };

  const onPointerUp = (_e: MouseEvent) => {
    isPointerDown = false;
    if (isDraggingSelection.value) {
      setTimeout(() => {
        isDraggingSelection.value = false;
      }, 50);
      
      if (selectionBox) {
        selectionBox.remove();
        selectionBox = null;
      }
      
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }
  };

  const checkIntersections = (box: { left: number; top: number; right: number; bottom: number }) => {
    if (!containerElement) return;
    
    const cards = containerElement.querySelectorAll('.selectable-card');
    const newSelection = new Set(dragBaseSelection);
    
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const intersects = !(
        rect.right < box.left || 
        rect.left > box.right || 
        rect.bottom < box.top || 
        rect.top > box.bottom
      );
      
      const id = Number((card as HTMLElement).dataset.id);
      
      if (intersects) {
        if (dragMode === 'toggle') {
          if (dragBaseSelection.has(id)) newSelection.delete(id);
          else newSelection.add(id);
        } else {
          newSelection.add(id);
        }
      }
    });
    
    const currentSelection = store.selectedItemIds;
    
    for (const id of currentSelection) {
      if (!newSelection.has(id)) {
        currentSelection.delete(id);
        const el = document.querySelector(`.selectable-card[data-id="${id}"]`);
        if (el) el.classList.remove('selected');
      }
    }
    
    for (const id of newSelection) {
      if (!currentSelection.has(id)) {
        currentSelection.add(id);
        const el = document.querySelector(`.selectable-card[data-id="${id}"]`);
        if (el) el.classList.add('selected');
      }
    }
  };

  function initSelection(containerSelector: string) {
    containerElement = document.querySelector(containerSelector) as HTMLElement;
    if (!containerElement) return;
    
    containerElement.addEventListener('mousedown', onPointerDown);
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
  }

  function destroySelection() {
    if (containerElement) {
      containerElement.removeEventListener('mousedown', onPointerDown);
    }
    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('mouseup', onPointerUp);
    
    if (selectionBox) {
      selectionBox.remove();
      selectionBox = null;
    }
  }

  return { initSelection, destroySelection, isDraggingSelection };
}
