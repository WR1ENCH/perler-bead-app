<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useThemeStore } from '@/stores/themeStore'

const router = useRouter()
const projectStore = useProjectStore()
const theme = useThemeStore()

onMounted(() => projectStore.loadList())

function openProject(id: string) {
  router.push(`/editor/${id}`)
}

async function deleteProject(id: string) {
  if (confirm('确定删除？')) {
    await projectStore.remove(id)
    await projectStore.loadList()
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <h2 class="text-xl font-bold mb-4" :class="{ 'font-pixel text-pink-400': theme.mode === 'pixel' }">
      我的项目
    </h2>
    <div v-if="projectStore.projectList.length === 0" class="text-center py-12 text-gray-400">
      暂无项目，去首页创建一个吧
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="project in projectStore.projectList"
        :key="project.id"
        @click="openProject(project.id)"
        class="border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div class="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center text-3xl">
          🧩
        </div>
        <p class="text-sm font-medium truncate">{{ project.name }}</p>
        <p class="text-xs text-gray-400">{{ new Date(project.createdAt).toLocaleDateString() }}</p>
        <button @click.stop="deleteProject(project.id)" class="text-xs text-red-400 mt-1">删除</button>
      </div>
    </div>
  </div>
</template>
