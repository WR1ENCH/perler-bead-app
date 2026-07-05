<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useThemeStore } from '@/stores/themeStore'
import ImageUploader from '@/components/ImageUploader.vue'
import QuickSettings from '@/components/QuickSettings.vue'

const router = useRouter()
const projectStore = useProjectStore()
const theme = useThemeStore()

const imageSrc = ref<string | null>(null)
const showSettings = ref(false)

function onImageUploaded(src: string) {
  imageSrc.value = src
  showSettings.value = true
}

function onStartEditing(settings: { gridWidth: number; similarityThreshold: number; mode: string }) {
  const project = projectStore.createNew('未命名项目', imageSrc.value!)
  project.settings.gridWidth = settings.gridWidth
  project.settings.similarityThreshold = settings.similarityThreshold
  project.settings.pixelationMode = settings.mode as any
  projectStore.save(project)
  router.push(`/editor/${project.id}`)
}
</script>

<template>
  <div class="max-w-2xl mx-auto pt-12">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2" :class="{ 'font-pixel text-pink-400': theme.mode === 'pixel' }">
        拼豆底图生成器
      </h1>
      <p class="text-gray-500">上传图片，一键生成可打印的拼豆图纸</p>
    </div>
    <ImageUploader @uploaded="onImageUploaded" />
    <QuickSettings
      v-if="showSettings && imageSrc"
      :image-src="imageSrc"
      @start="onStartEditing"
    />
  </div>
</template>
