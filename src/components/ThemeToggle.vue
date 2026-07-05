<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'
const theme = useThemeStore()
</script>

<template>
  <button
    @click="theme.toggle()"
    class="px-3 py-1 rounded text-sm border cursor-pointer"
    :class="theme.mode === 'pixel' ? 'border-pink-400 text-pink-400 font-pixel' : 'border-gray-300'"
  >
    {{ theme.mode === 'minimal' ? '像素' : '简约' }}
  </button>
</template>
