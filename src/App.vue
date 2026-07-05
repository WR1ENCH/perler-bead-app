<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'
import AppHeader from '@/components/AppHeader.vue'

const theme = useThemeStore()
</script>

<template>
  <div :class="['min-h-screen', theme.mode === 'pixel' ? 'theme-pixel' : '']">
    <AppHeader />
    <main class="container mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
