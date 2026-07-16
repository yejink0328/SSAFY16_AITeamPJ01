// composables/useChat.js
// 챗봇 대화 상태(메시지 목록, 로딩 상태)와 전송 로직을 관리하는 composable
// ChatWidget.vue 에서 이 함수를 불러와서 사용

import { ref } from 'vue'
import { askChatbot } from '@/services/openai'
import { filterRelevantData } from '@/services/dataFilter'

const GREETING = '안녕하세요! 무엇을 도와드릴까요?'

// 답변에 참고한 데이터에서 지도에 찍을 수 있는 장소만 추려낸다 (좌표 없는 항목 제외, 최대 5곳)
function extractPlaces(context) {
  const places = context
    .flatMap((c) => c.items)
    .filter((item) => item.lat && item.lng)
    .slice(0, 5)
  return places
}

// 동선/코스 관련 질문이면 지도에 순서(번호)와 이동 경로 선을 함께 표시한다
const routeKeywords = ['동선', '코스', '루트', '일정', '경로']
function isRouteQuestion(question) {
  return routeKeywords.some((k) => question.includes(k))
}

// 답변 마지막 줄의 "SUGGESTIONS: a|b|c" 마커를 분리해 후속 질문 칩 목록으로 뽑아낸다
function splitSuggestions(answer) {
  const match = answer.match(/\n?SUGGESTIONS:\s*(.+)\s*$/i)
  if (!match) return { text: answer, suggestions: [] }

  const text = answer.slice(0, match.index).trim()
  const suggestions = match[1]
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)

  return { text, suggestions }
}

export function useChat() {
  const messages = ref([]) // { role: 'user' | 'assistant', content: string }
  const loading = ref(false)

  async function sendMessage(question) {
    if (!question?.trim()) return

    messages.value.push({ role: 'user', content: question })
    loading.value = true

    try {
      const context = await filterRelevantData(question)
      const answer = await askChatbot(question, context, history)
      const { text, suggestions } = splitSuggestions(answer)
      const places = extractPlaces(context)
      const route = isRouteQuestion(question)
      messages.value.push({ role: 'assistant', content: text, places, route, suggestions })
      const answer = await askChatbot(question, context, messages.value)
      messages.value.push({ role: 'assistant', content: answer })
    } catch (e) {
      console.error(e)
      messages.value.push({
        role: 'assistant',
        content: '죄송해요, 잠시 후 다시 시도해주세요.',
      })
    } finally {
      loading.value = false
    }
  }

  return { messages, loading, sendMessage }
}
