import { ref, computed } from 'vue'

const currentTheme = ref<string>('auto')
const systemPrefersDark = ref<boolean>(true)
let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null

function updateEffectiveTheme() {
  const effective = (currentTheme.value === 'auto')
    ? (systemPrefersDark.value ? 'dark' : 'light')
    : (currentTheme.value === 'light' ? 'light' : 'dark')

  document.documentElement.setAttribute('data-theme', effective)
}

export function useTheme() {
  function initTheme(configuredTheme?: string) {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemPrefersDark.value = mediaQuery.matches

      if (!mediaQueryListener) {
        mediaQueryListener = (e: MediaQueryListEvent) => {
          systemPrefersDark.value = e.matches
          updateEffectiveTheme()
        }
        mediaQuery.addEventListener('change', mediaQueryListener)
      }
    }

    if (configuredTheme) {
      currentTheme.value = configuredTheme
    }

    updateEffectiveTheme()
  }

  function setTheme(theme: string) {
    currentTheme.value = theme || 'auto'
    updateEffectiveTheme()
  }

  const effectiveTheme = computed(() => {
    return (currentTheme.value === 'auto')
      ? (systemPrefersDark.value ? 'dark' : 'light')
      : (currentTheme.value === 'light' ? 'light' : 'dark')
  })

  return {
    currentTheme,
    effectiveTheme,
    initTheme,
    setTheme
  }
}
