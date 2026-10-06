import { buildSystemPrompt, parseTutorReply, sanitizeRequest } from '../../lib/tutor'

const FALLBACK =
  'Lo siento, he tenido un problema técnico. ¿Podrías intentar de nuevo? Estoy aquí para ayudarte con estructuras de acero. 😊'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const parsed = sanitizeRequest(req.body)
  if (parsed.error) return res.status(400).json({ response: parsed.error })
  const { messages, conversationState, studentData } = parsed.value

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Falta ANTHROPIC_API_KEY en el entorno del servidor')
    return res.status(500).json({ response: FALLBACK })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 1000,
        system: buildSystemPrompt(conversationState, studentData),
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const raw = data.content?.find((b) => b.type === 'text')?.text
    if (!raw) throw new Error('Respuesta vacía del modelo')

    const reply = parseTutorReply(raw, conversationState, studentData)
    return res.status(200).json({
      response: reply.text,
      conversationState: reply.conversationState,
      studentData: reply.studentData,
    })
  } catch (error) {
    console.error('Error generating response:', error)
    return res.status(500).json({ response: FALLBACK })
  }
}
