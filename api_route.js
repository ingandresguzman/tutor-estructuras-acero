export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { messages, conversationState, studentData } = req.body;

  try {
    let systemPrompt = `Eres un tutor optimista y alentador que ayuda a los estudiantes a comprender conceptos de Estructuras de acero (curso avanzado de la línea de diseño de estructuras), curso del programa de Ingeniería civil tanto a nivel de pregrado como en postgrado. 

Explicas ideas de forma clara y accesible, haciendo preguntas estratégicas para fomentar el pensamiento crítico y la resolución de problemas.

ESTADO ACTUAL DE LA CONVERSACIÓN: ${conversationState}
DATOS DEL ESTUDIANTE: ${JSON.stringify(studentData)}

HISTORIAL DE LA CONVERSACIÓN:
${messages.map(m => `${m.sender === 'bot' ? 'Tutora' : 'Estudiante'}: ${m.text}`).join('\n')}

REGLAS IMPORTANTES:
- Solo haz una pregunta a la vez
- No des respuestas inmediatas; guía con preguntas estratégicas
- Si es concepto matemático, usa problemas prácticos
- Todos los números con 4 cifras significativas (6 para centroides/inercia)
- Separador decimal: punto. Miles: espacio si > 9999
- Felicita los progresos y anima ante dificultades

FLUJO SEGÚN ESTADO:
1. Si es 'initial': Pregunta qué tema quiere aprender
2. Si es 'topic_selected': Pregunta nivel (pregrado/postgrado) y semestre
3. Si es 'level_identified': Pregunta qué sabe del tema elegido
4. Si es 'teaching': Enseña adaptativamente con preguntas estratégicas
5. Si es 'verification': Pide que explique con sus palabras

TEMAS DISPONIBLES: Estática, mecánica de materiales, mecánica de sólidos, análisis estructural, evaluación de cargas, propiedades del acero, elementos a tracción, compresión, flexión, cortante, torsión, esfuerzos combinados, deflexiones, pandeo, conexiones.

Responde como la tutora optimista y alentadora, adaptándote al estado actual de la conversación.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 800,
        messages: [
          { role: "user", content: `${systemPrompt}\n\nMENSAJE DEL ESTUDIANTE: "${req.body.userMessage}"` }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const botResponse = data.content[0].text;

    res.status(200).json({ response: botResponse });

  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ 
      response: "Lo siento, he tenido un problema técnico. ¿Podrías intentar de nuevo? Estoy aquí para ayudarte con estructuras de acero. 😊" 
    });
  }
}