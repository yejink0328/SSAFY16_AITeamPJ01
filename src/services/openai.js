// services/openai.js
// LocalHub 챗봇용 OpenAI API 호출 함수
// 클라이언트는 로컬 서버 프록시(`/api/chat`)를 호출합니다.

export async function askChatbot(question, contextData, history = []) {
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
