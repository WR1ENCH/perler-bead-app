<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ imageSrc: string }>()
const emit = defineEmits<{ start: [settings: { gridWidth: number; similarityThreshold: number; mode: string }] }>()

const gridWidth = ref(50)
const similarityThreshold = ref(30)
const pixelationMode = ref<'dominant' | 'average'>('dominant')

const gridHeight = computed(() => {
  const img = new Image()
  img.src = props.imageSrc
  const aspect = img.height / img.width
  return Math.round(gridWidth.value * (aspect || 1))
})

function start() {
  emit('start', {
    gridWidth: gridWidth.value,
    similarityThreshold: similarityThreshold.value,
    mode: pixelationMode.value
  })
}
</script>

<template>
  <div class="mt-6 p-4 rounded-lg border border-gray-200">
    <h3 class="font-medium mb-4">快速设置</h3>
    <div class="space-y-3">
      <div>
        <label class="text-sm text-gray-600">网格宽度: {{ gridWidth }}</label>
        <input type="range" v-model.number="gridWidth" min="10" max="200" class="w-full" />
      </div>
      <div>
        <label class="text-sm text-gray-600">颜色合并阈值: {{ similarityThreshold }}</label>
        <input type="range" v-model.number="similarityThreshold" min="0" max="100" class="w-full" />
      </div>
      <div>
        <label class="text-sm text-gray-600">像素化模式</label>
        <select v-model="pixelationMode" class="ml-2 border rounded px-2 py-1">
          <option value="dominant">主导色（边缘锐利）</option>
          <option value="average">均值（过渡平滑）</option>
        </select>
      </div>
      <p class="text-xs text-gray-400">预计网格: {{ gridWidth }} × {{ gridHeight }}</p>
      <button
        @click="start"
        class="w-full py-2 rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 cursor-pointer"
      >
        进入编辑器
      </button>
    </div>
  </div>
</template>
