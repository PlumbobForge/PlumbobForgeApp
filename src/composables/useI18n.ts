import { ref, computed } from 'vue'
import en from '@/locales/en.json'
import pl from '@/locales/pl.json'
import uk from '@/locales/uk.json'

const dictionaries: Record<string, any> = { en, pl, uk }
const supportedLanguages = ['en', 'pl', 'uk']

const currentLanguage = ref<string>('auto')
const detectedSystemLanguage = ref<string>('en')

function resolveLocale(langSetting: string): string {
  if (langSetting === 'auto') {
    return supportedLanguages.includes(detectedSystemLanguage.value) ? detectedSystemLanguage.value : 'en'
  }
  return supportedLanguages.includes(langSetting) ? langSetting : 'en'
}

const activeLocale = computed(() => resolveLocale(currentLanguage.value))

export function useI18n() {
  async function initI18n(configuredLang?: string) {
    let sysLang = 'en'
    if ((window as any).electronAPI?.getSystemLocale) {
      try {
        const rawLocale = await (window as any).electronAPI.getSystemLocale()
        if (rawLocale) {
          sysLang = rawLocale.toLowerCase().split(/[-_]/)[0]
        }
      } catch (e) {}
    } else if (navigator.language) {
      sysLang = navigator.language.toLowerCase().split(/[-_]/)[0]
    }

    detectedSystemLanguage.value = supportedLanguages.includes(sysLang) ? sysLang : 'en'

    if (configuredLang) {
      currentLanguage.value = configuredLang
    }
  }

  function setLanguage(lang: string) {
    currentLanguage.value = lang
  }

  function t(key: string, params?: Record<string, any>): string {
    const dict = dictionaries[activeLocale.value] || en
    const parts = key.split('.')
    let result: any = dict

    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part]
      } else {
        result = null;
        break;
      }
    }

    if (typeof result !== 'string') {
      // Fallback to English dictionary if key missing in active language
      let fallback: any = en
      for (const part of parts) {
        if (fallback && typeof fallback === 'object' && part in fallback) {
          fallback = fallback[part]
        } else {
          fallback = key
          break
        }
      }
      result = typeof fallback === 'string' ? fallback : key
    }

    if (params) {
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal))
      }
    }

    return result
  }

  return {
    currentLanguage,
    activeLocale,
    setLanguage,
    initI18n,
    t
  }
}
