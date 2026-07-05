<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import { useThemeStore } from '@/stores/themeStore'

const editorStore = useEditorStore()
const theme = useThemeStore()

defineEmits<{ export: [] }>()

function toggleManualMode() {
  editorStore.isManualMode = !editorStore.isManualMode
  if (!editorStore.isManualMode) {
    editorStore.isEraseMode = false
  }
}

function undo() {
  editorStore.undo()
}
</script>

<template>
  <div class="flex items-center gap-2 p-2 border-b" :class="{ 'border-pink-300': theme.mode === 'pixel' }">
    <button
      @click="toggleManualMode"
      class="px-3 py-1 rounded text-sm cursor-pointer"
      :class="editorStore.isManualMode ? 'bg-indigo-500 text-white' : 'bg-gray-100'"
    >
      编辑
    </button>
    <button
      @click="undo"
      class="px-3 py-1 rounded text-sm bg-gray-100 cursor-pointer"
      :disabled="editorStore.editHistory.length === 0"
    >
      撤销
    </button>
    <button
      @click="$emit('export')"
      class="px-3 py-1 rounded text-sm bg-green-500 text-white cursor-pointer"
    >
      导出
    </button>
    <span class="text-xs text-gray-400 ml-auto">
      网格: {{ editorStore.gridWidth }}x{{ editorStore.gridHeight }}
      | 颗粒: {{ editorStore.stats.totalBeadCount }}
    </span>
  </div>
</template>
