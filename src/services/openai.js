// services/openai.js
// LocalHub 챗봇용 OpenAI API 호출 함수
// .env 에 VITE_OPENAI_API_KEY 설정 필요 (Vite 프로젝트 규칙: VITE_ 접두사 필수)

export async function askChatbot(question, contextData, history = []) {
  const systemPrompt = `너는 LocalHub의 지역 정보 안내 챗봇이야.
아래 제공된 데이터 범위 내에서만 답변해. 데이터에 없는 내용은 모른다고 답해.
데이터: ${JSON.stringify(contextData)}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // 비용 고려해서 mini 추천, 필요시 gpt-4o로 교체
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: question },
      ],
    }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`API 호출 실패 (${res.status}): ${errorBody}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}
