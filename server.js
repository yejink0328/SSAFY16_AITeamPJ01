const express = require('express')
const axios = require('axios')
require('dotenv').config()

const app = express()
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  const { question, context, history } = req.body

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Server missing OPENAI_API_KEY' })
  }

  // 위도/경도는 지도 표시 전용 데이터라 모델에는 넘기지 않는다 (텍스트 답변에 좌표를 그대로 나열하는 걸 방지)
  const textOnlyContext = (context || []).map((c) => ({
    category: c.category,
    items: (c.items || []).map(({ lat, lng, ...rest }) => rest),
  }))

  const systemPrompt = `너는 LocalHub의 지역 정보 안내 챗봇이야.
아래 제공된 데이터 범위 내에서만 답변해. 데이터에 없는 내용은 모른다고 답해.
데이터: ${JSON.stringify(textOnlyContext)}

답변 스타일 규칙(반드시 지켜):
- 위도, 경도, 좌표 등 원시 수치 데이터는 답변에 절대 포함하지 마. 위치는 지도에 별도로 표시되니 텍스트로 반복할 필요 없어.
- 전화번호가 "정보 없음"이면 그 항목은 언급하지 마. 실제 번호가 있을 때만 보여줘.
- 각 장소 이름 앞에 종류에 어울리는 이모지를 하나씩 붙여줘 (예: 공원 🌳, 전시·박물관 🖼️, 축제 🎉, 쇼핑 🛍️, 숙소 🏨, 맛집 🍽️, 액티비티 🎢 등).
- 장소별로 줄바꿈을 두 번 넣어서(빈 줄 하나씩) 항목 사이를 시원하게 띄워줘.
- 불필요한 수식어 없이 핵심 정보만 간결하게 정리해.

답변 마지막에는 사용자가 이어서 물어볼 만한 후속 질문을 2~3개 제안해.
반드시 답변 본문과 완전히 분리된 마지막 줄에, 아래 형식 그대로 추가해:
SUGGESTIONS: 후속질문1|후속질문2|후속질문3
- 각 후속질문은 15자 내외로 짧게, 사용자가 그대로 다음 질문으로 보낼 수 있는 문장으로 작성해.
- 이 줄은 화면에 그대로 노출되지 않고 파싱되니, 형식(SUGGESTIONS: 로 시작, | 로 구분)을 반드시 지켜.`

  try {
    const payload = {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...(history || []),
        { role: 'user', content: question },
      ],
    }

    const r = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const content = r.data?.choices?.[0]?.message?.content
    return res.json({ content })
  } catch (err) {
    console.error(err.response?.data || err.message)
    const status = err.response?.status || 500
    return res.status(status).json({ error: err.response?.data || err.message })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Local API server listening on http://localhost:${port}`))
