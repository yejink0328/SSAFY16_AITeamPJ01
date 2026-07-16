<template>
  <div class="chat-widget" ref="widgetRef" :style="widgetStyle">
    <!-- 접힌 상태: 플로팅 버튼 -->
    <button v-if="!open" class="floating-btn" @click="open = true" aria-label="챗봇 열기">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2v2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <circle cx="12" cy="3.6" r="1.1" fill="currentColor" />
        <rect x="4" y="6.5" width="16" height="13" rx="4" stroke="currentColor" stroke-width="1.8" />
        <rect x="1.4" y="10.5" width="2.2" height="5" rx="1.1" fill="currentColor" />
        <rect x="20.4" y="10.5" width="2.2" height="5" rx="1.1" fill="currentColor" />
        <circle cx="9" cy="13" r="1.4" fill="currentColor" />
        <circle cx="15" cy="13" r="1.4" fill="currentColor" />
        <path d="M9 16.3c1 .9 5 .9 6 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
    </button>

    <!-- 펼친 상태: 대화창 -->
    <div v-else class="chat-panel">
      <div class="chat-header" @mousedown="onDragStart">
        <span>LocalHub 챗봇</span>
        <button class="close-btn" @click="open = false" aria-label="닫기">×</button>
      </div>

      <div class="chat-body" ref="bodyRef">
        <ChatMessage
          v-for="(msg, i) in messages"
          :key="i"
          :role="msg.role"
          :content="msg.content"
          :places="msg.places"
          :route="msg.route"
        />

        <div v-if="currentSuggestions.length" class="suggestions">
          <button
            v-for="q in currentSuggestions"
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
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { useChat } from '@/composables/useChat'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'

const open = ref(false)
const bodyRef = ref(null)
const widgetRef = ref(null)
const { messages, loading, sendMessage } = useChat()

const suggestedQuestions = ['서울 관광지 추천해줘', '이번 축제 일정 알려줘', '가볼만한 쇼핑 명소 알려줘']

// 대화 시작 시엔 기본 추천 질문을, 이후엔 마지막 답변이 제안한 후속 질문을 칩으로 보여준다
const currentSuggestions = computed(() => {
  if (loading.value) return []
  if (messages.value.length === 1) return suggestedQuestions

  const last = messages.value[messages.value.length - 1]
  return last?.role === 'assistant' && last.suggestions?.length ? last.suggestions : []
})

// 새 메시지 오면 스크롤 맨 아래로
watch(messages, async () => {
  await nextTick()
  if (bodyRef.value) {
    bodyRef.value.scrollTop = bodyRef.value.scrollHeight
  }
}, { deep: true })

// 헤더를 잡고 끌면 위치를 자유롭게 옮길 수 있도록 처리 (모바일 전체화면 모드에서는 비활성화)
const dragPos = ref(null)
let dragOrigin = null

// 닫으면 드래그로 옮긴 위치를 버리고 다음에 열 때/닫혔을 때 모두 기본 우측 하단으로 복귀
watch(open, (isOpen) => {
  if (!isOpen) dragPos.value = null
})

const widgetStyle = computed(() =>
  dragPos.value
    ? { left: `${dragPos.value.x}px`, top: `${dragPos.value.y}px`, right: 'auto', bottom: 'auto' }
    : {}
)

function onDragStart(e) {
  if (e.target.closest('.close-btn') || window.innerWidth <= 480) return

  const rect = widgetRef.value.getBoundingClientRect()
  dragOrigin = { startX: e.clientX, startY: e.clientY, startLeft: rect.left, startTop: rect.top }
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

function onDragMove(e) {
  if (!dragOrigin) return
  const rect = widgetRef.value.getBoundingClientRect()
  const maxLeft = window.innerWidth - rect.width
  const maxTop = window.innerHeight - rect.height

  dragPos.value = {
    x: Math.min(Math.max(dragOrigin.startLeft + (e.clientX - dragOrigin.startX), 0), maxLeft),
    y: Math.min(Math.max(dragOrigin.startTop + (e.clientY - dragOrigin.startY), 0), maxTop),
  }
}

function onDragEnd() {
  dragOrigin = null
  document.body.style.userSelect = ''
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
})
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
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.chat-panel {
  width: 420px;
  height: 620px;
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
  cursor: move;
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
