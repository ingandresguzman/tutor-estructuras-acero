const test = require('node:test')
const assert = require('node:assert')
const { buildSystemPrompt, parseTutorReply, sanitizeRequest, STATES } = require('../lib/tutor')

test('el prompt incluye el estado, las reglas numéricas y el formato de salida', () => {
  const p = buildSystemPrompt('teaching', { topic: 'Pandeo' })
  assert.match(p, /Estado actual de la conversación: teaching/)
  assert.match(p, /4 cifras significativas/)
  assert.match(p, /<meta>/)
  assert.match(p, /Pandeo/)
})

test('un estado desconocido se trata como initial', () => {
  assert.match(buildSystemPrompt('hack'), /conversación: initial/)
})

test('parseTutorReply separa el texto visible de los metadatos', () => {
  const raw = 'Hola\n<meta>{"estado":"topic_selected","tema":"Pandeo","nivel":"","semestre":"","conocimiento_previo":""}</meta>'
  const r = parseTutorReply(raw, 'initial', {})
  assert.strictEqual(r.text, 'Hola')
  assert.strictEqual(r.conversationState, 'topic_selected')
  assert.strictEqual(r.studentData.topic, 'Pandeo')
})

test('parseTutorReply conserva el estado si los metadatos fallan o faltan', () => {
  assert.strictEqual(parseTutorReply('Hola <meta>{mal}</meta>', 'teaching', {}).conversationState, 'teaching')
  assert.strictEqual(parseTutorReply('Hola', 'teaching', {}).conversationState, 'teaching')
  const r = parseTutorReply('x<meta>{"estado":"inventado"}</meta>', 'teaching', {})
  assert.ok(STATES.includes(r.conversationState))
  assert.strictEqual(r.conversationState, 'teaching')
})

test('sanitizeRequest descarta saludos iniciales y fusiona turnos repetidos', () => {
  const r = sanitizeRequest({
    messages: [
      { sender: 'bot', text: 'Hola' },
      { sender: 'user', text: 'a' },
      { sender: 'user', text: 'b' },
    ],
    conversationState: 'initial',
  })
  assert.deepStrictEqual(r.value.messages, [{ role: 'user', content: 'a\n\nb' }])
})

test('sanitizeRequest rechaza entradas inválidas', () => {
  assert.ok(sanitizeRequest(null).error)
  assert.ok(sanitizeRequest({ messages: [] }).error)
  assert.ok(sanitizeRequest({ messages: [{ sender: 'bot', text: 'x' }] }).error)
})

test('sanitizeRequest limita el largo de los mensajes', () => {
  const r = sanitizeRequest({ messages: [{ sender: 'user', text: 'a'.repeat(9000) }] })
  assert.strictEqual(r.value.messages[0].content.length, 4000)
})

test('el prompt usa "el NSR-10" y nunca "la NSR-10"', () => {
  const p = buildSystemPrompt('initial')
  assert.match(p, /el NSR-10/)
  assert.doesNotMatch(p.replace(/nunca "la NSR-10"/, ''), /la NSR-10/)
})
