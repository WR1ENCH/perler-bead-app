import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeMode = 'minimal' | 'pixel'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(
    (localStorage.getItem('theme') as ThemeMode) || 'minimal'
  )

  function toggle() {
    mode.value = mode.value === 'minimal' ? 'pixel' : 'minimal'
    localStorage.setItem('theme', mode.value)
  }

  function set(m: ThemeMode) {
    mode.value = m
    localStorage.setItem('theme', m)
  }

  return { mode, toggle, set }
})
