<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function show(msg: string) {
  message.value = msg
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { visible.value = false }, 2000)
}

defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-white bg-gray-800 z-50 transition-all"
    >
      {{ message }}
    </div>
  </Teleport>
</template>
