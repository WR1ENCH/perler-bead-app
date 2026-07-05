import type { RgbColor, ColorSystem, PaletteColor } from '@/types'
import colorSystemMapping from '@/data/colorSystemMapping.json'

type ColorSystemMap = Record<string, Record<string, string>>

export function getColorKeyByHex(hex: string, system: ColorSystem): string {
  const map = colorSystemMapping as ColorSystemMap
  const entry = map[hex.toUpperCase()]
  if (!entry) return hex
  return entry[system] || hex
}

export function convertPaletteToColorSystem(
  palette: PaletteColor[],
  system: ColorSystem
): PaletteColor[] {
  return palette.map(color => ({
    ...color,
    key: getColorKeyByHex(color.hex, system)
  }))
}

export function getMardToHexMapping(): Record<string, string> {
  const map = colorSystemMapping as ColorSystemMap
  const result: Record<string, string> = {}
  for (const [hex, brands] of Object.entries(map)) {
    result[brands['MARD']] = hex
  }
  return result
}

export function getAllHexValues(): string[] {
  return Object.keys(colorSystemMapping as ColorSystemMap)
}

export function hexToRgb(hex: string): RgbColor | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!match) return null
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16)
  }
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(hex)
  if (!rgb) return { h: 0, s: 0, l: 0 }
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

export function sortColorsByHue<T extends { color: string }>(colors: T[]): T[] {
  return [...colors].sort((a, b) => {
    const ha = hexToHsl(a.color)
    const hb = hexToHsl(b.color)
    if (ha.h !== hb.h) return ha.h - hb.h
    if (ha.l !== hb.l) return ha.l - hb.l
    return ha.s - hb.s
  })
}
