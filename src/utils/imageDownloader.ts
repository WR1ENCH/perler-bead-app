import type { MappedPixel, ColorCount } from '@/types'
import type { GridDownloadOptions } from '@/types/download'
import { getColorKeyByHex, sortColorsByHue } from './colorSystemUtils'

interface DownloadParams {
  cells: MappedPixel[][]
  gridWidth: number
  gridHeight: number
  colorCounts: Record<string, ColorCount>
  totalBeadCount: number
  options: GridDownloadOptions
  colorSystem: string
}

export function downloadImage(params: DownloadParams) {
  const { cells, gridWidth, gridHeight, colorCounts, totalBeadCount, options, colorSystem } = params
  const cellSize = 16
  const padding = 40
  const titleBarHeight = 50
  const statsHeight = options.includeStats ? 200 : 0
  const watermarkHeight = options.watermark ? 30 : 0

  const canvasW = gridWidth * cellSize + padding * 2
  const canvasH = titleBarHeight + gridHeight * cellSize + padding * 2 + statsHeight + watermarkHeight

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvasW, canvasH)

  ctx.fillStyle = '#1F2937'
  ctx.fillRect(0, 0, canvasW, titleBarHeight)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '16px sans-serif'
  ctx.fillText('拼豆底图生成器', 16, 32)

  const gridX = padding
  const gridY = titleBarHeight + padding

  for (let r = 0; r < gridHeight; r++) {
    for (let c = 0; c < gridWidth; c++) {
      const cell = cells[r]?.[c]
      if (cell?.isExternal) continue
      ctx.fillStyle = cell?.color || '#FFFFFF'
      ctx.fillRect(gridX + c * cellSize, gridY + r * cellSize, cellSize, cellSize)
    }
  }

  if (options.showGrid) {
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 0.5
    for (let r = 0; r <= gridHeight; r++) {
      ctx.beginPath()
      ctx.moveTo(gridX, gridY + r * cellSize)
      ctx.lineTo(gridX + gridWidth * cellSize, gridY + r * cellSize)
      ctx.stroke()
    }
    for (let c = 0; c <= gridWidth; c++) {
      ctx.beginPath()
      ctx.moveTo(gridX + c * cellSize, gridY)
      ctx.lineTo(gridX + c * cellSize, gridY + gridHeight * cellSize)
      ctx.stroke()
    }
  }

  if (options.showColorCodes) {
    ctx.font = '6px sans-serif'
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    for (let r = 0; r < gridHeight; r++) {
      for (let c = 0; c < gridWidth; c++) {
        const cell = cells[r]?.[c]
        if (cell?.isExternal) continue
        const code = getColorKeyByHex(cell?.color || '', colorSystem as any)
        ctx.fillText(code, gridX + c * cellSize + 1, gridY + r * cellSize + 7)
      }
    }
  }

  if (options.includeStats) {
    const statsY = gridY + gridHeight * cellSize + padding
    ctx.fillStyle = '#F3F4F6'
    ctx.fillRect(0, statsY, canvasW, statsHeight)

    ctx.fillStyle = '#1F2937'
    ctx.font = '14px sans-serif'
    ctx.fillText(`材料清单 (共 ${totalBeadCount} 颗)`, padding, statsY + 24)

    const entries = Object.entries(colorCounts).map(([hex, data]) => ({
      hex, color: data.color, count: data.count
    }))
    const sorted = sortColorsByHue(entries).sort((a, b) => b.count - a.count)

    ctx.font = '12px sans-serif'
    let y = statsY + 50
    for (const item of sorted.slice(0, 40)) {
      ctx.fillStyle = item.color
      ctx.fillRect(padding, y - 10, 14, 14)
      ctx.strokeStyle = '#D1D5DB'
      ctx.strokeRect(padding, y - 10, 14, 14)
      ctx.fillStyle = '#1F2937'
      ctx.fillText(`${getColorKeyByHex(item.hex, colorSystem as any)}: ${item.count}`, padding + 22, y + 1)
      y += 20
    }
  }

  if (options.watermark) {
    const wmY = canvasH - watermarkHeight + 8
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('拼豆底图生成器', canvasW / 2, wmY)
    ctx.textAlign = 'start'
  }

  const link = document.createElement('a')
  link.download = `perler-pattern-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
