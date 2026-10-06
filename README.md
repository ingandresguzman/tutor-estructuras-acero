# Tutor virtual de Estructuras de Acero

Chat tutor para estudiantes de Ingeniería Civil (pregrado y postgrado). Usa el método
socrático: guía con preguntas en lugar de dar la respuesta directa. Hecho con Next.js 14,
React, Tailwind y la API de Anthropic.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y completa ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Otros comandos: `npm run build`, `npm test`, `npm run lint`.

## Estructura

| Ruta | Descripción |
|---|---|
| `pages/index.js` | Interfaz del chat, progreso por etapas y panel del estudiante |
| `pages/api/chat.js` | Endpoint que llama a la API de Anthropic (la clave solo vive en el servidor) |
| `lib/tutor.js` | Prompt de sistema, máquina de estados, validación de la petición |
| `components/MessageText.js` | Render de Markdown y fórmulas LaTeX (KaTeX) |
| `tests/` | Pruebas de la lógica del tutor (`node --test`) |

## Cómo funciona el flujo

Etapas: `initial` → `topic_selected` → `level_identified` → `teaching` → `verification`.
El modelo decide la transición y la devuelve en un bloque `<meta>` al final de su respuesta;
el servidor lo extrae, lo valida y lo envía al cliente junto con los datos del estudiante.
Si el bloque falta o es inválido, se conserva el estado anterior.

## Configuración

- `ANTHROPIC_API_KEY`: obligatoria, solo en el servidor.
- `ANTHROPIC_MODEL`: opcional, por defecto `claude-sonnet-5-5`.
