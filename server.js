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

  const systemPrompt = `너는 LocalHub의 지역 정보 안내 챗봇이야.\n아래 제공된 데이터 범위 내에서만 답변해. 데이터에 없는 내용은 모른다고 답해.\n데이터: ${JSON.stringify(
    context || []
  )}`

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
