import { generateTextWithProvider } from '../config/aiProvider.js';
import Note from '../models/Note.js';

const NOTE_TYPE_PROMPTS = {
  detailed: 'Generate comprehensive, detailed study notes on the given topic. Include definitions, explanations, examples, and key takeaways. Use markdown headings, bold for key terms, and organized sections.',
  short: 'Generate concise short notes on the topic. Focus on key points only. Use bullet points and brief explanations.',
  bullet: 'Generate bullet-point notes. Each point should be a single, clear statement. Group related points under subheadings.',
  exam: 'Generate exam-oriented notes. Focus on frequently asked questions, important definitions, formulas, and key concepts. Include potential exam questions.',
  revision: 'Generate a quick revision sheet. Summarize the most critical points in the shortest form possible. Use tables, lists, and highlighted terms.',
  definitions: 'Generate a list of important definitions and terms related to the topic. Each definition should be clear and concise.',
  viva: 'Generate likely viva/oral exam questions with brief, structured answers on the topic.',
  mcq: 'Generate 10 multiple choice questions on the topic. Include 4 options each with the correct answer marked.',
  pyq: 'Generate answers to common previous year questions on the topic. Provide well-structured, exam-ready answers.',
  flashcards: 'Generate 15 flashcards on the topic. Format each as:\n**Q:** [question]\n**A:** [concise answer]\n\nSeparate each flashcard with a horizontal rule (---). Cover key terms, concepts, and facts.',
};

export const generateNotes = async (req, res) => {
  try {
    const { topic, type = 'detailed', subject = '', provider = 'groq' } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const prompt = NOTE_TYPE_PROMPTS[type] || NOTE_TYPE_PROMPTS.detailed;
    const subjectContext = subject ? ` in the context of ${subject}` : '';

    const systemPrompt = `You are NoteNova AI, a study notes generator. ${prompt}`;
    const userPrompt = `Topic: ${topic}${subjectContext}`;

    const content = await generateTextWithProvider(systemPrompt, userPrompt, provider);
    res.json({ content, topic, type, provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const aiTransform = async (req, res) => {
  try {
    const { content, action, provider = 'groq' } = req.body;
    if (!content || !action) return res.status(400).json({ error: 'Content and action required' });

    const actions = {
      summarize: 'Summarize the following content concisely while keeping all key information:',
      bullets: 'Convert the following content into clear bullet points:',
      simplify: 'Simplify the following content so a beginner can understand it:',
      expand: 'Expand and elaborate on the following content with more details and examples:',
      flashcards: 'Convert the following content into flashcard format (Q: question / A: answer):',
      quiz: 'Generate a quiz with 5 questions based on the following content. Include answers:',
    };

    const actionPrompt = actions[action] || actions.summarize;
    const systemPrompt = 'You are NoteNova AI. Respond in clean markdown format.';
    const userPrompt = `${actionPrompt}\n\n${content}`;

    const result = await generateTextWithProvider(systemPrompt, userPrompt, provider);
    res.json({ content: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const subject = req.query.subject || '';
    const search  = req.query.search  || '';

    const query = { userId: req.userId, isDeleted: { $ne: true } };
    if (subject) query.subject = subject;
    if (search) {
      query.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { tags:    { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await Note.find(query)
      .select('title subject tags isPinned noteType createdAt updatedAt')
      .sort({ isPinned: -1, updatedAt: -1 });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId, isDeleted: { $ne: true } });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const note = await Note.create({ userId: req.userId, ...req.body });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const importMarkdown = async (req, res) => {
  try {
    const { title = 'Imported Note', markdown = '', subject = '' } = req.body;
    if (!markdown.trim()) return res.status(400).json({ error: 'Markdown content is required' });

    const note = await Note.create({
      userId: req.userId,
      title: title.trim(),
      content: markdown,
      subject,
      noteType: 'custom',
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, isDeleted: { $ne: true } },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note moved to trash', noteId: note._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
