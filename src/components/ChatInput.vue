<template>
  <form class="chat-input" @submit.prevent="submit">
    <input
      v-model="text"
      type="text"
      placeholder="메시지를 입력하세요"
      :disabled="loading"
    />
    <button type="submit" :disabled="loading || !text.trim()">전송</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['send'])

const text = ref('')

function submit() {
  if (!text.value.trim()) return
  emit('send', text.value)
  text.value = ''
}
</script>

<style scoped>
.chat-input {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid #e5e5e5;
}
.chat-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}
.chat-input button {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: #2563eb;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}
.chat-input button:disabled {
  background: #aaa;
  cursor: not-allowed;
}
</style>
