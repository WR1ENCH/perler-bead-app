export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface OklabColor {
  l: number
  a: number
  b: number
}

export interface PaletteColor {
  key: string
  hex: string
  rgb: RgbColor
}

export interface MappedPixel {
  key: string
  color: string
  isExternal?: boolean
}

export enum PixelationMode {
  Dominant = 'dominant',
  Average = 'average'
}

export type BeadBrand = 'MARD' | 'COCO' | '漫漫' | '盼盼' | '咪小窝'

export type ColorSystem = BeadBrand

export interface BeadColor {
  index: number
  hex: string
  name: string
  code: string
  brand: BeadBrand
}

export interface ProjectSettings {
  gridWidth: number
  gridHeight: number
  maxColors: number
  brand: BeadBrand
  pixelationMode: PixelationMode
  similarityThreshold: number
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  thumbnail?: string
  settings: ProjectSettings
  palette: PaletteColor[]
  cells: MappedPixel[][]
  sourceImage?: string
  excludedColors: string[]
  colorSystem: ColorSystem
}

export interface ColorCount {
  count: number
  color: string
}

export interface EditSnapshot {
  cells: MappedPixel[][]
  colorCounts: Record<string, ColorCount>
  totalBeadCount: number
}
