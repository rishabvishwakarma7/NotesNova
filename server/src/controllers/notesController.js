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

// ── Creative Notes ────────────────────────────────────────────────────────────
export const generateCreativeNotes = async (req, res) => {
  try {
    const { topic, subject = '', level = 'intermediate', provider = 'groq' } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const subjectCtx = subject ? ` (Subject: ${subject})` : '';
    const levelCtx = level || 'intermediate';

    const systemPrompt = `You are NoteNova AI, an expert educational content creator and professor. Generate comprehensive, university-level study notes as JSON. Always return valid JSON only — no markdown, no code fences. Be extremely detailed and educational.`;

    const userPrompt = `Create comprehensive visual study notes for: "${topic}"${subjectCtx}
Level: ${levelCtx}

Return a JSON object with this EXACT structure (be thorough, detailed, and educational — not surface-level):
{
  "title": "Complete Topic Title",
  "subject": "${subject || 'General'}",
  "level": "${level}",
  "emoji": "relevant emoji",
  "color": "blue",
  "relatedTopics": ["Related Topic 1", "Related Topic 2", "Related Topic 3", "Related Topic 4", "Related Topic 5"],
  "sections": [
    {
      "type": "overview",
      "title": "What is ${topic}?",
      "content": "Detailed 3-4 sentence explanation covering what it is, why it matters, and real-world significance.",
      "keyPoints": ["Key insight 1 with explanation", "Key insight 2 with explanation", "Key insight 3 with explanation", "Key insight 4 with explanation", "Key insight 5 with explanation"]
    },
    {
      "type": "definitions",
      "title": "Essential Terminology",
      "items": [
        { "term": "Technical Term", "definition": "Clear, precise definition with context and usage" },
        { "term": "Term 2", "definition": "Definition 2" },
        { "term": "Term 3", "definition": "Definition 3" },
        { "term": "Term 4", "definition": "Definition 4" },
        { "term": "Term 5", "definition": "Definition 5" },
        { "term": "Term 6", "definition": "Definition 6" }
      ]
    },
    {
      "type": "concepts",
      "title": "Core Concepts Explained",
      "items": [
        { "name": "Concept Name", "explanation": "Detailed 2-3 sentence explanation with mechanism and purpose", "example": "Concrete real-world example showing application" },
        { "name": "Concept 2", "explanation": "Explanation 2", "example": "Example 2" },
        { "name": "Concept 3", "explanation": "Explanation 3", "example": "Example 3" },
        { "name": "Concept 4", "explanation": "Explanation 4", "example": "Example 4" }
      ]
    },
    {
      "type": "flowchart",
      "title": "Step-by-Step Process",
      "steps": [
        { "step": 1, "label": "Step Name", "description": "What happens in this step and why" },
        { "step": 2, "label": "Step 2", "description": "Description 2" },
        { "step": 3, "label": "Step 3", "description": "Description 3" },
        { "step": 4, "label": "Step 4", "description": "Description 4" },
        { "step": 5, "label": "Step 5", "description": "Description 5" }
      ]
    },
    {
      "type": "comparison",
      "title": "Key Comparisons",
      "headers": ["Aspect", "Approach A", "Approach B"],
      "rows": [["Feature 1","Value A","Value B"],["Feature 2","Value A","Value B"],["Feature 3","Value A","Value B"],["Feature 4","Value A","Value B"],["Feature 5","Value A","Value B"]]
    },
    {
      "type": "examples",
      "title": "Practical Examples with Code",
      "items": [
        { "title": "Basic Example", "description": "What this example demonstrates and why it is important", "code": "# Actual working code here\\nprint('example')" },
        { "title": "Intermediate Example", "description": "More complex scenario", "code": "# More complex code" },
        { "title": "Real-World Application", "description": "Industry use case", "code": "" }
      ]
    },
    {
      "type": "tips",
      "title": "Expert Tips, Common Mistakes & Warnings",
      "tips": [
        { "type": "tip", "text": "Pro tip with actionable advice a student can immediately apply" },
        { "type": "warning", "text": "Common mistake students make and exactly how to avoid it" },
        { "type": "important", "text": "Critical concept that is frequently tested in exams" },
        { "type": "tip", "text": "Efficiency tip or optimization advice" },
        { "type": "warning", "text": "Another common pitfall with explanation" }
      ]
    },
    {
      "type": "memory",
      "title": "Memory Tricks & Mnemonics",
      "tricks": [
        "Clever acronym or mnemonic to remember key steps: e.g., SOLID stands for...",
        "Visual analogy: Think of X like a Y because...",
        "Rhyme or pattern to remember: ...",
        "Story technique: Imagine you are a...",
        "Comparison to everyday life: Just like when you..."
      ]
    },
    {
      "type": "quiz",
      "title": "Test Your Understanding",
      "questions": [
        { "q": "Conceptual question about fundamentals?", "options": ["A) Correct answer with explanation", "B) Common wrong answer", "C) Another distractor", "D) Fourth option"], "answer": "A", "explanation": "Detailed explanation of why A is correct and why others are wrong" },
        { "q": "Application-based question?", "options": ["A) Option", "B) Correct answer", "C) Option", "D) Option"], "answer": "B", "explanation": "Explanation 2" },
        { "q": "Analysis question?", "options": ["A) Option", "B) Option", "C) Correct answer", "D) Option"], "answer": "C", "explanation": "Explanation 3" },
        { "q": "Tricky exam-style question?", "options": ["A) Option", "B) Option", "C) Option", "D) Correct answer"], "answer": "D", "explanation": "Explanation 4" },
        { "q": "Practical implementation question?", "options": ["A) Correct answer", "B) Option", "C) Option", "D) Option"], "answer": "A", "explanation": "Explanation 5" }
      ]
    },
    {
      "type": "summary",
      "title": "Key Takeaways & Exam Preparation",
      "points": [
        "Most important concept stated clearly and memorably",
        "Second key takeaway with practical significance",
        "Third takeaway connecting to broader context",
        "Fourth takeaway focusing on common exam angles",
        "Fifth takeaway — what makes this topic unique"
      ],
      "examTips": [
        "Specific exam tip: questions often ask about X, so remember Y",
        "Common exam trap: students confuse A with B — the difference is...",
        "High-value topic: always appears in exams as...",
        "Time-saving trick during exams: when you see X in a question, immediately think Y"
      ]
    }
  ]
}

Critical rules:
- Every definition must be precise and complete — not vague
- Every example must be concrete and real, not generic
- Code examples must be actual working code relevant to ${topic}
- Quiz questions must test real understanding, not just memorization  
- Memory tricks must be genuinely helpful and creative
- Do not use placeholder text like "Description 1" — write real content
- Return ONLY the JSON object, nothing else`;

    const raw = await generateTextWithProvider(systemPrompt, userPrompt, provider);

    // Extract JSON robustly
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI did not return valid JSON');

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('Failed to parse creative notes JSON');
    }

    res.json({ notes: parsed, topic, subject, level });
  } catch (err) {
    console.error('Creative notes error:', err);
    res.status(500).json({ error: err.message });
  }
};
