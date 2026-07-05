<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { downloadImage } from '@/utils/imageDownloader'
import type { GridDownloadOptions } from '@/types/download'

const editorStore = useEditorStore()
const emit = defineEmits<{ close: [] }>()

const options = ref<GridDownloadOptions>({
  showGrid: true,
  gridInterval: 10,
  showCoordinates: true,
  showColorCodes: true,
  includeStats: true,
  watermark: true
})

function exportPNG() {
  downloadImage({
    cells: editorStore.cells,
    gridWidth: editorStore.gridWidth,
    gridHeight: editorStore.gridHeight,
    colorCounts: editorStore.stats.colorCounts,
    totalBeadCount: editorStore.stats.totalBeadCount,
    options: options.value,
    colorSystem: 'MARD'
  })
}
</script>

<template>
  <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" @click.self="emit('close')">
    <div class="bg-white rounded-xl p-6 w-96">
      <h3 class="font-medium mb-4">导出设置</h3>
      <div class="space-y-3">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="options.showGrid" /> 显示网格线
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="options.showColorCodes" /> 显示色号
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="options.includeStats" /> 包含材料清单
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="options.watermark" /> 水印
        </label>
      </div>
      <div class="flex gap-2 mt-6">
        <button @click="emit('close')" class="flex-1 py-2 rounded border text-sm cursor-pointer">取消</button>
        <button @click="exportPNG" class="flex-1 py-2 rounded bg-indigo-500 text-white text-sm cursor-pointer">导出 PNG</button>
      </div>
    </div>
  </div>
</template>
