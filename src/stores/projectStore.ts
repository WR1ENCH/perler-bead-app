import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project } from '@/types'
import { PixelationMode } from '@/types'
import { db } from '@/utils/db'

export const useProjectStore = defineStore('project', () => {
  const current = ref<Project | null>(null)
  const projectList = ref<Project[]>([])

  async function loadList() {
    projectList.value = await db.projects.toArray()
  }

  async function load(id: string) {
    current.value = (await db.projects.get(id)) || null
  }

  async function save(project: Project) {
    project.updatedAt = Date.now()
    await db.projects.put(project)
    current.value = project
  }

  async function remove(id: string) {
    await db.projects.delete(id)
    if (current.value?.id === id) current.value = null
  }

  function createNew(name: string, sourceImage?: string): Project {
    return {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      thumbnail: undefined,
      settings: {
        gridWidth: 50,
        gridHeight: 50,
        maxColors: 32,
        brand: 'MARD',
        pixelationMode: PixelationMode.Dominant,
        similarityThreshold: 30
      },
      palette: [],
      cells: [],
      sourceImage,
      excludedColors: [],
      colorSystem: 'MARD'
    }
  }

  return { current, projectList, loadList, load, save, remove, createNew }
})
