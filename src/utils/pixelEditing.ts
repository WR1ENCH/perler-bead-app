import type { MappedPixel } from '@/types'

export function floodFillErase(
  data: MappedPixel[][],
  N: number,
  M: number,
  startRow: number,
  startCol: number,
  targetKey: string
): MappedPixel[][] {
  const result = data.map(row => row.map(cell => ({ ...cell })))
  const visited = new Set<string>()
  const stack: [number, number][] = [[startRow, startCol]]

  while (stack.length > 0) {
    const [r, c] = stack.pop()!
    const key = `${r},${c}`
    if (r < 0 || r >= M || c < 0 || c >= N) continue
    if (visited.has(key)) continue
    if (result[r][c].key !== targetKey) continue
    visited.add(key)
    result[r][c] = { key: 'ERASE', color: '#FFFFFF', isExternal: true }
    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1])
  }

  return result
}

export function replaceColor(
  data: MappedPixel[][],
  sourceHex: string,
  targetHex: string,
  targetKey: string
): { data: MappedPixel[][]; count: number } {
  let count = 0
  const result = data.map(row =>
    row.map(cell => {
      if (cell.color.toUpperCase() === sourceHex.toUpperCase() && !cell.isExternal) {
        count++
        return { key: targetKey, color: targetHex }
      }
      return { ...cell }
    })
  )
  return { data: result, count }
}

export function paintPixel(
  data: MappedPixel[][],
  row: number,
  col: number,
  newKey: string,
  newColor: string
): MappedPixel[][] {
  const result = data.map(r => r.map(c => ({ ...c })))
  result[row][col] = { key: newKey, color: newColor }
  return result
}

export function recalculateStats(data: MappedPixel[][]) {
  const colorCounts: Record<string, { count: number; color: string }> = {}
  let total = 0
  for (const row of data) {
    for (const cell of row) {
      if (cell && !cell.isExternal && cell.key !== 'ERASE') {
        const hex = cell.color.toUpperCase()
        if (colorCounts[hex]) {
          colorCounts[hex].count++
        } else {
          colorCounts[hex] = { count: 1, color: cell.color }
        }
        total++
      }
    }
  }
  return { colorCounts, totalBeadCount: total }
}
