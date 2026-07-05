<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'
import ThemeToggle from './ThemeToggle.vue'

const theme = useThemeStore()
</script>

<template>
  <header class="border-b border-gray-200 dark:border-gray-700" :class="{ 'border-pink-300': theme.mode === 'pixel' }">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2">
        <span class="text-xl font-bold" :class="{ 'font-pixel text-pink-400': theme.mode === 'pixel' }">
          拼豆底图
        </span>
      </RouterLink>
      <nav class="flex items-center gap-4">
        <RouterLink to="/projects" class="text-sm hover:text-indigo-500">项目</RouterLink>
        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>
