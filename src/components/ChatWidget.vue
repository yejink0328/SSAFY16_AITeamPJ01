<template>
  <div class="chat-widget">
    <!-- 접힌 상태: 플로팅 버튼 -->
    <button v-if="!open" class="floating-btn" @click="open = true" aria-label="챗봇 열기">
      💬
    </button>

    <!-- 펼친 상태: 대화창 -->
    <div v-else class="chat-panel">
      <div class="chat-header">
        <span>LocalHub 챗봇</span>
        <button class="close-btn" @click="open = false" aria-label="닫기">×</button>
      </div>

      <div class="chat-body" ref="bodyRef">
        <ChatMessage
          v-for="(msg, i) in messages"
          :key="i"
          :role="msg.role"
          :content="msg.content"
        />

        <div v-if="messages.length === 1" class="suggestions">
          <button
            v-for="q in suggestedQuestions"
            :key="q"
            class="suggestion-chip"
            :disabled="loading"
            @click="sendMessage(q)"
          >
            {{ q }}
          </button>
        </div>

        <div v-if="loading" class="loading">답변 작성 중...</div>
      </div>

      <ChatInput :loading="loading" @send="sendMessage" />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'

const open = ref(false)
const bodyRef = ref(null)
const { messages, loading, sendMessage } = useChat()

const suggestedQuestions = ['서울 관광지 추천해줘', '이번 축제 일정 알려줘', '가볼만한 쇼핑 명소 알려줘']

// 새 메시지 오면 스크롤 맨 아래로
watch(messages, async () => {
  await nextTick()
  if (bodyRef.value) {
    bodyRef.value.scrollTop = bodyRef.value.scrollHeight
  }
}, { deep: true })
</script>

<style scoped>
.chat-widget {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}

.floating-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #2563eb;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.chat-panel {
  width: 340px;
  height: 480px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 12px 16px;
  background: #2563eb;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.loading {
  font-size: 13px;
  color: #888;
  padding: 4px 0;
}

.suggestions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  margin: 6px 0;
}

.suggestion-chip {
  border: 1px solid #2563eb;
  background: #fff;
  color: #2563eb;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}

.suggestion-chip:hover {
  background: #eff6ff;
}

.suggestion-chip:disabled {
  border-color: #ccc;
  color: #999;
  cursor: not-allowed;
}

/* 모바일: 전체 화면으로 전환 (RFP 요구사항) */
@media (max-width: 480px) {
  .chat-widget {
    right: 0;
    bottom: 0;
  }
  .chat-panel {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
}
</style>
