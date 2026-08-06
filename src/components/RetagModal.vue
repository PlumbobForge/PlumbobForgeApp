<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="retagState.visible" style="display: flex;">
      <div class="modal modal-centered" style="max-width: 480px; width: 100%;">
        <span class="material-symbols-outlined modal-icon primary">sell</span>
        <h2 class="modal-title">{{ t('modal.retag_title') }}</h2>

        <div style="text-align: left; width: 100%; margin-bottom: 1rem; position: relative;">
          <label style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; display: block; color: var(--text-main);">
            {{ t('modal.retag_category') }}
          </label>
          <div class="sort-trigger-wrapper" @click.stop="categoryDropdownOpen = !categoryDropdownOpen">
            <button class="btn sort-trigger" style="width: 100%; justify-content: space-between;">
              <span>{{ getCategoryLabel(selectedCategory) }}</span>
              <span class="material-symbols-outlined" style="font-size:20px;">expand_more</span>
            </button>
            <div v-if="categoryDropdownOpen" class="context-menu" style="position: absolute; width: 100%; top: 100%; margin-top: 4px; z-index: 100;">
              <div class="context-menu-item" :style="{ color: selectedCategory === 'CAS' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="selectCategory('CAS')">
                {{ t('cm.cas_items') }}
              </div>
              <div class="context-menu-item" :style="{ color: selectedCategory === 'BuildBuy' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="selectCategory('BuildBuy')">
                {{ t('cm.buildbuy_items') }}
              </div>
              <div class="context-menu-item" :style="{ color: selectedCategory === 'Other' ? 'var(--primary)' : 'var(--text-main)' }" @click.stop="selectCategory('Other')">
                {{ t('cm.other_items') }}
              </div>
            </div>
          </div>
        </div>

        <!-- CAS Tags -->
        <div v-if="selectedCategory === 'CAS'" style="text-align: left; width: 100%; margin-bottom: 1.5rem;">
          <label style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; display: block; color: var(--text-main);">
            {{ t('modal.retag_tags') }}
          </label>
          <div class="cas-categories-container" style="max-height: 180px; overflow-y: auto; padding: 4px;">
            <button
              v-for="cat in casCategoriesList"
              :key="cat"
              type="button"
              class="cas-category-pill"
              :class="{ active: selectedTags.has(cat) }"
              @click="toggleTag(cat)"
            >
              <span v-if="casCategoryIcons[cat]" class="material-symbols-outlined mr-1" style="font-size: 16px;">
                {{ casCategoryIcons[cat] }}
              </span>
              {{ t('cas_categories.' + cat) }}
            </button>
          </div>
        </div>

        <!-- Other Sub-category Tags -->
        <div v-if="selectedCategory === 'Other'" style="text-align: left; width: 100%; margin-bottom: 1.5rem;">
          <label style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; display: block; color: var(--text-main);">
            {{ t('modal.retag_tags') }}
          </label>
          <div class="cas-categories-container" style="display: flex; flex-wrap: wrap; gap: 0.25rem; padding: 4px;">
            <button
              v-for="sub in otherSubCategoriesList"
              :key="sub"
              type="button"
              class="cas-category-pill"
              :class="{ active: selectedOtherSubCategory === sub }"
              @click="selectedOtherSubCategory = sub"
            >
              <span v-if="otherSubCategoryIcons[sub]" class="material-symbols-outlined mr-1" style="font-size: 16px;">
                {{ otherSubCategoryIcons[sub] }}
              </span>
              {{ t('other_subcategories.' + sub) }}
            </button>
          </div>
        </div>

        <div class="modal-actions-spaced">
          <button class="btn btn-secondary" @click="cancel">{{ t('modal.cancel') }}</button>
          <button class="btn btn-primary" @click="confirm">{{ t('modal.save') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';

const { retagState } = useModal();
const { t } = useI18n();

const selectedCategory = ref('CAS');
const selectedTags = ref<Set<string>>(new Set());
const selectedOtherSubCategory = ref<string>('Misc');
const categoryDropdownOpen = ref(false);

function selectCategory(cat: string) {
  selectedCategory.value = cat;
  categoryDropdownOpen.value = false;
}

function getCategoryLabel(cat: string) {
  if (cat === 'CAS') return t('cm.cas_items');
  if (cat === 'BuildBuy') return t('cm.buildbuy_items');
  return t('cm.other_items');
}

const casCategoriesList = ['Hair', 'Full body', 'Tops', 'Bottoms', 'Shoes', 'Details', 'Skins', 'Accessories', 'Sliders', 'Presets', 'Other'];

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
};

const otherSubCategoriesList = ['Worlds', 'Sims', 'Lots', 'Misc'];

const otherSubCategoryIcons: Record<string, string> = {
  'Worlds': 'public',
  'Sims': 'person',
  'Lots': 'home',
  'Misc': 'category'
};

const closeDropdown = () => {
  categoryDropdownOpen.value = false;
};

onMounted(() => {
  window.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown);
});

watch(() => retagState.visible, (visible) => {
  if (visible) {
    const rawType = retagState.packageType || 'CAS';

    if (rawType === 'CAS') {
      selectedCategory.value = 'CAS';
      selectedTags.value = new Set(retagState.casCategories || []);
      selectedOtherSubCategory.value = 'Misc';
    } else if (rawType === 'BuildBuy' || rawType === 'Build/Buy' || rawType === 'Object') {
      selectedCategory.value = 'BuildBuy';
      selectedTags.value = new Set();
      selectedOtherSubCategory.value = 'Misc';
    } else {
      selectedCategory.value = 'Other';
      selectedTags.value = new Set();
      if (rawType === 'World') selectedOtherSubCategory.value = 'Worlds';
      else if (rawType === 'Sim') selectedOtherSubCategory.value = 'Sims';
      else if (rawType === 'Lot') selectedOtherSubCategory.value = 'Lots';
      else selectedOtherSubCategory.value = 'Misc';
    }

    categoryDropdownOpen.value = false;
  }
});

function toggleTag(cat: string) {
  if (selectedTags.value.has(cat)) {
    selectedTags.value.delete(cat);
  } else {
    selectedTags.value.add(cat);
  }
}

function cancel() {
  retagState.visible = false;
  if (retagState.resolve) retagState.resolve(null);
}

function confirm() {
  retagState.visible = false;
  if (retagState.resolve) {
    let finalPackageType = selectedCategory.value;
    let tagsString = '';

    if (selectedCategory.value === 'CAS') {
      finalPackageType = 'CAS';
      tagsString = Array.from(selectedTags.value).join(',');
    } else if (selectedCategory.value === 'BuildBuy') {
      finalPackageType = 'BuildBuy';
      tagsString = '';
    } else if (selectedCategory.value === 'Other') {
      if (selectedOtherSubCategory.value === 'Worlds') finalPackageType = 'World';
      else if (selectedOtherSubCategory.value === 'Sims') finalPackageType = 'Sim';
      else if (selectedOtherSubCategory.value === 'Lots') finalPackageType = 'Lot';
      else finalPackageType = 'Other';
      tagsString = '';
    }

    retagState.resolve({
      confirmed: true,
      packageType: finalPackageType,
      casCategories: tagsString
    });
  }
}
</script>
