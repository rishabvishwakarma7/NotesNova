import { generateTextStream } from '../config/gemini.js';
import Chat from '../models/Chat.js';

const MODE_PROMPTS = {
  study: 'You are NoteNova AI, a helpful study assistant. Explain concepts clearly with examples. Use markdown formatting for better readability.',
  coding: 'You are NoteNova AI, a coding tutor. Help with programming questions, debug code, and explain algorithms. Use code blocks with syntax highlighting.',
  research: 'You are NoteNova AI, a research assistant. Provide in-depth, well-structured analysis with citations and multiple perspectives.',
  exam: 'You are NoteNova AI, an exam preparation coach. Focus on key concepts, common exam questions, and concise answers. Use bullet points and highlight important terms.',
  simple: 'You are NoteNova AI. Explain everything in the simplest possible terms, as if teaching a beginner. Use analogies and everyday examples.',
};

export const streamChat = async (req, res) => {
  try {
    const { messages, mode = 'study' } = req.body;
    if (!messages || !messages.length) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.study;
    const stream = await generateTextStream(systemPrompt, messages);

    for await (const chunk of stream) {
      const content = chunk.text();
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Stream error:', err);
    if (!res.headersSent) {
      if (err.status === 401 || err.message?.includes('API key') || err.message?.includes('api_key')) {
        res.status(401).json({ error: 'Invalid API key. Please check your configuration.', code: 'invalid_key' });
      } else if (err.status === 429 || err.message?.includes('quota') || err.message?.includes('rate limit') || err.message?.includes('exhausted')) {
        res.status(429).json({ error: 'AI rate limit reached. Please wait a moment and try again.', code: 'rate_limited' });
      } else {
        res.status(500).json({ error: 'Failed to stream response: ' + err.message, code: 'stream_error' });
      }
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
};

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId })
      .select('title mode isPinned createdAt updatedAt')
      .sort({ isPinned: -1, updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.userId });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveChat = async (req, res) => {
  try {
    const { title, messages, mode } = req.body;
    const chat = await Chat.create({ userId: req.userId, title, messages, mode });
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
