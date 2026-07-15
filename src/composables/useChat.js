// composables/useChat.js
// 챗봇 대화 상태(메시지 목록, 로딩 상태)와 전송 로직을 관리하는 composable
// ChatWidget.vue 에서 이 함수를 불러와서 사용

import { ref } from 'vue'
import { askChatbot } from '@/services/openai'
import { filterRelevantData } from '@/services/dataFilter'

const GREETING = '안녕하세요! 무엇을 도와드릴까요?'

export function useChat() {
  const messages = ref([{ role: 'assistant', content: GREETING }])
  const loading = ref(false)

  async function sendMessage(question) {
    if (!question?.trim()) return

    const history = messages.value.slice(1) // 인사말 제외
    messages.value.push({ role: 'user', content: question })
    loading.value = true

    try {
      const context = await filterRelevantData(question)
      const answer = await askChatbot(question, context, history)
        messages.value.push({ role: 'assistant', content: answer })
    } catch (e) {
      console.error(e)
      const raw = e?.message || ''
      const userFriendly =
        raw.includes('model_not_found') || raw.includes('does not have access to model')
          ? '사용 가능한 모델에 대한 접근 권한이 없습니다. 관리자에게 문의하세요.'
          : raw || '죄송해요, 잠시 후 다시 시도해주세요.'

      messages.value.push({ role: 'assistant', content: userFriendly })
    } finally {
      loading.value = false
    }
  }

  return { messages, loading, sendMessage }
}
