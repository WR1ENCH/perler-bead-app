<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { useThemeStore } from '@/stores/themeStore'
import { paintPixel } from '@/utils/pixelEditing'
import { getColorKeyByHex } from '@/utils/colorSystemUtils'

const editorStore = useEditorStore()
const theme = useThemeStore()
const canvasRef = ref<HTMLCanvasElement>()
const containerRef = ref<HTMLDivElement>()
const tooltip = ref<{ x: number; y: number; text: string } | null>(null)

const cellSize = computed(() => Math.max(4, Math.min(20, 800 / editorStore.gridWidth)))

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const cells = editorStore.cells
  const N = editorStore.gridWidth
  const M = editorStore.gridHeight
  const size = cellSize.value

  canvas.width = N * size
  canvas.height = M * size

  for (let r = 0; r < M; r++) {
    for (let c = 0; c < N; c++) {
      const cell = cells[r]?.[c]
      if (cell?.isExternal) continue
      ctx.fillStyle = cell?.color || '#FFFFFF'
      ctx.fillRect(c * size, r * size, size, size)
    }
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 0.5
  for (let r = 0; r <= M; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * size); ctx.lineTo(N * size, r * size); ctx.stroke()
  }
  for (let c = 0; c <= N; c++) {
    ctx.beginPath(); ctx.moveTo(c * size, 0); ctx.lineTo(c * size, M * size); ctx.stroke()
  }
}

watch(() => editorStore.cells, render, { deep: true })
onMounted(render)

function onCanvasClick(e: MouseEvent) {
  if (!editorStore.isManualMode || !editorStore.selectedColor) return
  const rect = canvasRef.value!.getBoundingClientRect()
  const col = Math.floor((e.clientX - rect.left) / cellSize.value)
  const row = Math.floor((e.clientY - rect.top) / cellSize.value)
  if (row < 0 || row >= editorStore.gridHeight || col < 0 || col >= editorStore.gridWidth) return

  editorStore.pushSnapshot()
  const newCells = paintPixel(
    editorStore.cells, row, col,
    editorStore.selectedColor.key,
    editorStore.selectedColor.color
  )
  editorStore.setCells(newCells)
}

function onCanvasMove(e: MouseEvent) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const col = Math.floor((e.clientX - rect.left) / cellSize.value)
  const row = Math.floor((e.clientY - rect.top) / cellSize.value)
  const cell = editorStore.cells[row]?.[col]
  if (cell && !cell.isExternal) {
    const code = getColorKeyByHex(cell.color, 'MARD')
    tooltip.value = { x: e.clientX, y: e.clientY, text: `${code} (${cell.color})` }
  } else {
    tooltip.value = null
  }
}
</script>

<template>
  <div ref="containerRef" class="flex-1 overflow-auto bg-gray-50 rounded-lg relative">
    <canvas
      ref="canvasRef"
      @click="onCanvasClick"
      @mousemove="onCanvasMove"
      @mouseleave="tooltip = null"
      class="cursor-crosshair"
      :class="{ 'image-pixelated': theme.mode === 'pixel' }"
    />
    <div
      v-if="tooltip"
      class="fixed px-2 py-1 bg-gray-800 text-white text-xs rounded pointer-events-none z-50"
      :style="{ left: tooltip.x + 12 + 'px', top: tooltip.y - 30 + 'px' }"
    >
      {{ tooltip.text }}
    </div>
  </div>
</template>

<style scoped>
.image-pixelated {
  image-rendering: pixelated;
}
</style>
