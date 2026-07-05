import type { RgbColor, OklabColor, PaletteColor, MappedPixel } from '@/types'
import { PixelationMode } from '@/types'

const oklabCache = new Map<string, OklabColor>()

function srgbToLinear(c: number): number {
  c = c / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function rgbToOklab(rgb: RgbColor): OklabColor {
  const key = `${rgb.r},${rgb.g},${rgb.b}`
  const cached = oklabCache.get(key)
  if (cached) return cached

  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)

  let l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  let m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  let s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  l = Math.cbrt(l)
  m = Math.cbrt(m)
  s = Math.cbrt(s)

  const result: OklabColor = {
    l: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  }

  oklabCache.set(key, result)
  return result
}

export function oklabDistance(a: OklabColor, b: OklabColor): number {
  const dl = a.l - b.l
  const da = a.a - b.a
  const db = a.b - b.b
  return Math.sqrt(dl * dl + da * da + db * db) * 100
}

export function colorDistance(rgb1: RgbColor, rgb2: RgbColor): number {
  return oklabDistance(rgbToOklab(rgb1), rgbToOklab(rgb2))
}

export function findClosestPaletteColor(
  target: RgbColor,
  palette: PaletteColor[]
): PaletteColor {
  let best = palette[0]
  let bestDist = Infinity
  for (const color of palette) {
    const dist = colorDistance(target, color.rgb)
    if (dist === 0) return color
    if (dist < bestDist) {
      bestDist = dist
      best = color
    }
  }
  return best
}

export function calculateCellRepresentativeColor(
  imageData: ImageData,
  startX: number,
  startY: number,
  width: number,
  height: number,
  mode: PixelationMode
): RgbColor | null {
  const data = imageData.data
  let rSum = 0, gSum = 0, bSum = 0, count = 0
  const freqMap = new Map<string, number>()

  for (let y = startY; y < startY + height && y < imageData.height; y++) {
    for (let x = startX; x < startX + width && x < imageData.width; x++) {
      const idx = (y * imageData.width + x) * 4
      const a = data[idx + 3]
      if (a < 128) continue
      const r = data[idx], g = data[idx + 1], b = data[idx + 2]
      rSum += r; gSum += g; bSum += b; count++

      if (mode === PixelationMode.Dominant) {
        const key = `${r},${g},${b}`
        freqMap.set(key, (freqMap.get(key) || 0) + 1)
      }
    }
  }

  if (count === 0) return null

  if (mode === PixelationMode.Dominant && freqMap.size > 0) {
    let bestKey = '', bestCount = 0
    for (const [key, cnt] of freqMap) {
      if (cnt > bestCount) { bestCount = cnt; bestKey = key }
    }
    const [r, g, b] = bestKey.split(',').map(Number)
    return { r, g, b }
  }

  return { r: Math.round(rSum / count), g: Math.round(gSum / count), b: Math.round(bSum / count) }
}

export function calculatePixelGrid(
  ctx: CanvasRenderingContext2D,
  imgWidth: number,
  imgHeight: number,
  N: number,
  M: number,
  palette: PaletteColor[],
  mode: PixelationMode,
  fallback: PaletteColor
): MappedPixel[][] {
  const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight)
  const cellW = imgWidth / N
  const cellH = imgHeight / M
  const grid: MappedPixel[][] = []

  for (let row = 0; row < M; row++) {
    grid[row] = []
    for (let col = 0; col < N; col++) {
      const startX = Math.floor(col * cellW)
      const startY = Math.floor(row * cellH)
      const w = Math.ceil((col + 1) * cellW) - startX
      const h = Math.ceil((row + 1) * cellH) - startY

      const representative = calculateCellRepresentativeColor(imageData, startX, startY, w, h, mode)
      if (!representative) {
        grid[row][col] = { key: fallback.key, color: fallback.hex, isExternal: true }
        continue
      }

      const matched = findClosestPaletteColor(representative, palette)
      grid[row][col] = { key: matched.key, color: matched.hex }
    }
  }

  return grid
}

export function mergeSimilarColors(
  data: MappedPixel[][],
  palette: PaletteColor[],
  threshold: number
): MappedPixel[][] {
  const keyToRgb = new Map<string, RgbColor>()
  for (const p of palette) {
    keyToRgb.set(p.key, p.rgb)
  }

  const merged = data.map(row => row.map(cell => ({ ...cell, isExternal: cell.isExternal ?? false })))
  const N = merged[0]?.length ?? 0
  const M = merged.length

  const colorCounts: Record<string, number> = {}
  for (const row of merged) {
    for (const cell of row) {
      if (cell && cell.key && !cell.isExternal) {
        colorCounts[cell.key] = (colorCounts[cell.key] || 0) + 1
      }
    }
  }

  const sorted = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0])

  const replaced = new Set<string>()

  for (let i = 0; i < sorted.length; i++) {
    const currentKey = sorted[i]
    if (replaced.has(currentKey)) continue
    const currentRgb = keyToRgb.get(currentKey)
    if (!currentRgb) continue

    for (let j = i + 1; j < sorted.length; j++) {
      const lowerKey = sorted[j]
      if (replaced.has(lowerKey)) continue
      const lowerRgb = keyToRgb.get(lowerKey)
      if (!lowerRgb) continue

      if (colorDistance(currentRgb, lowerRgb) < threshold) {
        replaced.add(lowerKey)
        for (let r = 0; r < M; r++) {
          for (let c = 0; c < N; c++) {
            if (merged[r][c].key === lowerKey) {
              merged[r][c] = { key: currentKey, color: merged[r][c].color, isExternal: false }
            }
          }
        }
      }
    }
  }

  return merged
}

export function removeBackground(
  data: MappedPixel[][],
  N: number,
  M: number,
  bgColorKeys: Set<string>
): MappedPixel[][] {
  const result = data.map(row => row.map(cell => ({ ...cell, isExternal: cell.isExternal ?? false })))
  const visited = new Set<string>()

  function flood(row: number, col: number) {
    const stack: [number, number][] = [[row, col]]
    while (stack.length > 0) {
      const [r, c] = stack.pop()!
      const key = `${r},${c}`
      if (r < 0 || r >= M || c < 0 || c >= N) continue
      if (visited.has(key)) continue
      if (!bgColorKeys.has(result[r][c].key)) continue
      visited.add(key)
      result[r][c].isExternal = true
      stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1])
    }
  }

  for (let c = 0; c < N; c++) {
    flood(0, c)
    flood(M - 1, c)
  }
  for (let r = 0; r < M; r++) {
    flood(r, 0)
    flood(r, N - 1)
  }

  return result
}
