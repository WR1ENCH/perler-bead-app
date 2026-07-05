<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'

const editorStore = useEditorStore()

function selectColor(key: string, color: string) {
  editorStore.selectedColor = { key, color }
  editorStore.isManualMode = true
}
</script>

<template>
  <div class="border rounded-lg p-3">
    <h3 class="text-sm font-medium mb-2">当前颜色 ({{ editorStore.stats.colorCounts ? Object.keys(editorStore.stats.colorCounts).length : 0 }})</h3>
    <div class="flex flex-wrap gap-1">
      <button
        v-for="(count, hex) in editorStore.stats.colorCounts"
        :key="hex"
        @click="selectColor(editorStore.cells.flat().find(c => c.color.toUpperCase() === hex)?.key || '', count.color)"
        class="w-7 h-7 rounded border cursor-pointer relative"
        :style="{ backgroundColor: count.color }"
        :class="{ 'ring-2 ring-indigo-500': editorStore.selectedColor?.color.toUpperCase() === hex }"
      >
        <span class="absolute -top-1 -right-1 text-[8px] bg-gray-800 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
          {{ count.count }}
        </span>
      </button>
    </div>
  </div>
</template>
