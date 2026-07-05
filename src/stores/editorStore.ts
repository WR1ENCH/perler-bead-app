import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MappedPixel, PaletteColor, EditSnapshot } from '@/types'
import { recalculateStats } from '@/utils/pixelEditing'

export const useEditorStore = defineStore('editor', () => {
  const cells = ref<MappedPixel[][]>([])
  const palette = ref<PaletteColor[]>([])
  const gridWidth = ref(50)
  const gridHeight = ref(50)
  const selectedColor = ref<{ key: string; color: string } | null>(null)
  const isManualMode = ref(false)
  const isEraseMode = ref(false)
  const highlightColorKey = ref<string | null>(null)
  const editHistory = ref<EditSnapshot[]>([])
  const bgRemovalSnapshot = ref<EditSnapshot | null>(null)

  const stats = computed(() => recalculateStats(cells.value))

  function pushSnapshot() {
    editHistory.value.push({
      cells: cells.value.map(r => r.map(c => ({ ...c }))),
      colorCounts: stats.value.colorCounts,
      totalBeadCount: stats.value.totalBeadCount
    })
    if (editHistory.value.length > 50) {
      editHistory.value.shift()
    }
  }

  function undo() {
    if (editHistory.value.length === 0) return false
    const snap = editHistory.value.pop()!
    cells.value = snap.cells
    return true
  }

  function setCells(newCells: MappedPixel[][]) {
    cells.value = newCells
  }

  function setPalette(p: PaletteColor[]) {
    palette.value = p
  }

  return {
    cells, palette, gridWidth, gridHeight,
    selectedColor, isManualMode, isEraseMode,
    highlightColorKey, editHistory, bgRemovalSnapshot,
    stats, pushSnapshot, undo, setCells, setPalette
  }
})
