/**
 * gemini.js — powered by Groq (free, fast, drop-in replacement)
 * Using llama-3.3-70b-versatile — free tier with generous limits
 */
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Simple text generation (non-streaming).
 */
export async function generateText(systemPrompt, userPrompt) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });
  return response.choices[0].message.content;
}

/**
 * Streaming text generation.
 * Returns an async iterable of chunks with a .text() method
 * to match the interface used in chatController.js.
 */
export async function generateTextStream(systemPrompt, messages) {
  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages: groqMessages,
    stream: true,
  });

  return (async function* () {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      yield {
        text: () => content,
      };
    }
  })();
}

export default groq;
