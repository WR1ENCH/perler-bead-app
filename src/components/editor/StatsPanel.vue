<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { getColorKeyByHex, sortColorsByHue } from '@/utils/colorSystemUtils'

const editorStore = useEditorStore()

const sortedColors = computed(() => {
  if (!editorStore.stats.colorCounts) return []
  const entries = Object.entries(editorStore.stats.colorCounts).map(([hex, data]) => ({
    hex,
    color: data.color,
    count: data.count
  }))
  return sortColorsByHue(entries).sort((a, b) => b.count - a.count)
})
</script>

<template>
  <div class="border rounded-lg p-3">
    <h3 class="text-sm font-medium mb-2">材料清单</h3>
    <p class="text-xs text-gray-400 mb-2">总计: {{ editorStore.stats.totalBeadCount }} 颗</p>
    <div class="space-y-1 max-h-60 overflow-y-auto">
      <div v-for="item in sortedColors" :key="item.hex" class="flex items-center gap-2 text-xs">
        <span class="w-4 h-4 rounded border inline-block shrink-0" :style="{ backgroundColor: item.color }"></span>
        <span class="text-gray-500 w-12">{{ getColorKeyByHex(item.hex, 'MARD') }}</span>
        <span class="font-medium">{{ item.count }}</span>
      </div>
    </div>
  </div>
</template>
