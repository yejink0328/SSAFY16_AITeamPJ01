// services/openai.js
// LocalHub 챗봇용 OpenAI API 호출 함수
// .env 에 VITE_OPENAI_API_KEY 설정 필요 (Vite 프로젝트 규칙: VITE_ 접두사 필수)

export async function askChatbot(question, contextData, history = []) {
  // 클라이언트는 로컬 서버 프록시(`/api/chat`)를 호출합니다.
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context: contextData, history }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API 호출 실패 (${res.status}): ${text}`)
  }

  const data = await res.json()
  return data.content
}
