<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useEditorStore } from '@/stores/editorStore'
import { useThemeStore } from '@/stores/themeStore'
import { calculatePixelGrid, mergeSimilarColors } from '@/utils/pixelEngine'
import { hexToRgb, getAllHexValues } from '@/utils/colorSystemUtils'
import type { PaletteColor } from '@/types'
import { PixelationMode } from '@/types'
import EditorCanvas from '@/components/editor/EditorCanvas.vue'
import EditorToolbar from '@/components/editor/EditorToolbar.vue'
import PalettePanel from '@/components/editor/PalettePanel.vue'
import StatsPanel from '@/components/editor/StatsPanel.vue'
import ExportDialog from '@/components/editor/ExportDialog.vue'

const route = useRoute()
const projectStore = useProjectStore()
const editorStore = useEditorStore()
const theme = useThemeStore()

const canvasRef = ref<InstanceType<typeof EditorCanvas>>()
const processing = ref(false)
const showExport = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  await projectStore.load(id)
  if (!projectStore.current) return

  const p = projectStore.current
  editorStore.gridWidth = p.settings.gridWidth
  editorStore.gridHeight = p.settings.gridHeight

  if (p.cells.length > 0) {
    editorStore.setCells(p.cells)
    editorStore.setPalette(p.palette)
    return
  }

  if (p.sourceImage) {
    await processImage(p.sourceImage)
  }
})

async function processImage(src: string) {
  processing.value = true
  try {
    const p = projectStore.current!
    const img = new Image()
    img.src = src
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('图片加载失败'))
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    const allHexValues = getAllHexValues()
    const palette: PaletteColor[] = allHexValues.map(hex => {
      const rgb = hexToRgb(hex)
      return rgb ? { key: hex, hex, rgb } : null
    }).filter(Boolean) as PaletteColor[]
    const fallback: PaletteColor = { key: 'T1', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 } }

    const grid = calculatePixelGrid(
      ctx, img.width, img.height,
      p.settings.gridWidth, p.settings.gridHeight,
      palette, p.settings.pixelationMode, fallback
    )

    const merged = mergeSimilarColors(grid, palette, p.settings.similarityThreshold)
    editorStore.setCells(merged)
    editorStore.setPalette(palette)
    p.cells = merged
    p.palette = palette
    await projectStore.save(p)
  } catch (e) {
    console.error('处理图片失败:', e)
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <div class="flex gap-4 h-[calc(100vh-80px)]" :class="{ 'font-pixel': theme.mode === 'pixel' }">
    <div class="flex-1 flex flex-col">
      <EditorToolbar @export="showExport = true" />
      <div v-if="processing" class="flex-1 flex items-center justify-center text-gray-400">
        处理中...
      </div>
      <EditorCanvas v-else ref="canvasRef" />
    </div>
    <div class="w-72 space-y-4">
      <PalettePanel />
      <StatsPanel />
    </div>
    <ExportDialog v-if="showExport" @close="showExport = false" />
  </div>
</template>
