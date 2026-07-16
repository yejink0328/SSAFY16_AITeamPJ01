<template>
  <div class="chat-message" :class="role">
    <div class="bubble-col">
      <div class="bubble">{{ content }}</div>
      <KakaoMapEmbed v-if="places?.length" :places="places" :route="route" />
    </div>
  </div>
</template>

<script setup>
import KakaoMapEmbed from './KakaoMapEmbed.vue'

defineProps({
  role: { type: String, required: true }, // 'user' | 'assistant'
  content: { type: String, required: true },
  places: { type: Array, default: () => [] },
  route: { type: Boolean, default: false },
})
</script>

<style scoped>
.chat-message {
  display: flex;
  margin: 6px 0;
}
.chat-message.user {
  justify-content: flex-end;
}
.chat-message.assistant {
  justify-content: flex-start;
}
.bubble-col {
  display: flex;
  flex-direction: column;
  max-width: 75%;
}
.bubble {
  padding: 11px 15px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.65;
  letter-spacing: -0.2px;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
}
.chat-message.user .bubble {
  background: #2563eb;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.chat-message.assistant .bubble {
  background: #f1f1f1;
  color: #222;
  border-bottom-left-radius: 4px;
}
</style>
