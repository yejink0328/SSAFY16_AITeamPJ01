<template>
  <div class="chat-message" :class="role">
    <div class="bubble">{{ content }}</div>
  </div>
</template>

<script setup>
defineProps({
  role: { type: String, required: true }, // 'user' | 'assistant'
  content: { type: String, required: true },
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
.bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
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
