import Dexie, { type Table } from 'dexie'
import type { Project } from '@/types'

class PerlerBeadDB extends Dexie {
  projects!: Table<Project, string>

  constructor() {
    super('perlerBeadDB')
    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt'
    })
  }
}

export const db = new PerlerBeadDB()
