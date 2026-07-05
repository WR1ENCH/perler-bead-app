<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ uploaded: [src: string] }>()
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement>()

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = () => emit('uploaded', reader.result as string)
  reader.readAsDataURL(file)
}
</script>

<template>
  <div
    class="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors"
    :class="dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'"
    @drop.prevent="onDrop"
    @dragover.prevent="dragOver = true"
    @dragleave="dragOver = false"
    @click="fileInput?.click()"
  >
    <div class="text-4xl mb-3">📸</div>
    <p class="text-gray-600 mb-1">点击或拖拽上传图片</p>
    <p class="text-sm text-gray-400">支持 JPG / PNG 格式</p>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
  </div>
</template>
