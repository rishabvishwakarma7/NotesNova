import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Groq client (default / free tier)
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Gemini client
const googleAi = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const OPENAI_MODEL = 'gpt-4o-mini';
const GEMINI_MODEL = 'gemini-1.5-flash';

/**
 * Generate text using specified provider or auto-fallback
 * Providers: 'groq' | 'openai' | 'gemini'
 */
export async function generateTextWithProvider(systemPrompt, userPrompt, provider = 'groq') {
  // 1. Try OpenAI if requested
  if (provider === 'openai' && openai) {
    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });
      return response.choices[0].message.content;
    } catch (err) {
      console.warn('⚠️ OpenAI failed, falling back to Groq:', err.message);
    }
  }

  // 2. Try Gemini if requested
  if (provider === 'gemini' && googleAi) {
    try {
      const model = googleAi.getGenerativeModel({ model: GEMINI_MODEL });
      const prompt = `${systemPrompt}\n\n${userPrompt}`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.warn('⚠️ Gemini failed, falling back to Groq:', err.message);
    }
  }

  // 3. Primary / Fallback: Groq
  if (groq) {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });
    return response.choices[0].message.content;
  }

  // Final fallback if no key available
  throw new Error('No AI provider available. Please configure GROQ_API_KEY or OPENAI_API_KEY.');
}

/**
 * Stream text completion with specified provider
 */
export async function generateTextStreamWithProvider(systemPrompt, messages, provider = 'groq') {
  if (provider === 'openai' && openai) {
    const stream = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: true,
    });

    return (async function* () {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        yield { text: () => content };
      }
    })();
  }

  // Default: Groq stream
  if (groq) {
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const stream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: groqMessages,
      stream: true,
    });

    return (async function* () {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        yield { text: () => content };
      }
    })();
  }

  throw new Error('No streaming AI provider configured');
}
