import { generateText } from '../config/gemini.js';
import PYQ from '../models/PYQ.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/* ── helpers ── */

function buildPrompt(subject, examType, questionCount, context) {
  return `Generate ${questionCount} highly likely exam questions for the subject: "${subject}" (${examType}).

${context}

Respond ONLY with valid JSON in this exact format:
{
  "title": "PYQ Analysis: ${subject}",
  "questions": [
    {
      "question": "Full question text",
      "answer": "Complete model answer with key points",
      "marks": 5,
      "importance": "high",
      "type": "short",
      "year": "2023",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}

Rules:
- importance: "high" = very likely (repeat pattern), "medium" = moderately likely, "low" = good to know
- type: "short" (2-5 marks), "long" (10-15 marks), "mcq" (1 mark), "numerical" (calculation)
- Distribute: 40% high, 40% medium, 20% low importance
- If real past questions are provided, identify repeating topics and mark them "high"
- Include variety of question types
- keywords = key terms the answer must include`;
}

/* ── Generate from text/syllabus ── */
export const generatePYQ = async (req, res) => {
  try {
    const { subject, syllabus, examType = 'University Exam', questionCount = 15 } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject is required' });

    const context = syllabus
      ? `Syllabus/Topics provided:\n${syllabus}`
      : 'No syllabus provided — use standard exam patterns for this subject.';

    const systemPrompt = `You are an expert exam question predictor. Analyze subjects and predict likely exam questions. Respond only with JSON.`;
    const userPrompt = buildPrompt(subject, examType, questionCount, context);

    let content = await generateText(systemPrompt, userPrompt);
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    let parsed;
    try { parsed = JSON.parse(content); }
    catch { return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' }); }

    const pyq = await PYQ.create({
      userId: req.userId,
      subject, syllabus, examType,
      title: parsed.title || `PYQ: ${subject}`,
      questions: parsed.questions || [],
    });

    res.status(201).json(pyq);
  } catch (err) {
    console.error('PYQ generation error:', err);
    res.status(500).json({ error: err.message });
  }
};

/* ── Generate from uploaded PDF ── */
export const generatePYQFromPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

    const { subject, examType = 'University Exam', questionCount = 15 } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject is required' });

    // Extract text from PDF
    let pdfText = '';
    try {
      const data = await pdfParse(req.file.buffer);
      pdfText = data.text?.trim() || '';
    } catch (err) {
      return res.status(400).json({ error: 'Failed to read PDF. Make sure it is a valid, text-based PDF (not scanned image).' });
    }

    if (!pdfText || pdfText.length < 50) {
      return res.status(400).json({ error: 'PDF appears to be empty or is a scanned image. Please upload a text-based PDF.' });
    }

    // Truncate if very long (keep first 8000 chars to stay within token limits)
    const truncated = pdfText.length > 8000 ? pdfText.slice(0, 8000) + '\n\n[PDF truncated due to length]' : pdfText;

    const context = `REAL PAST EXAM QUESTIONS from uploaded PDF:
---
${truncated}
---
IMPORTANT: 
- Identify questions or topics that appear multiple times across years — mark as "high" importance
- Extract actual question patterns from the PDF
- Generate similar questions based on these real patterns
- If marks are visible in the PDF, use them
- Note the year if visible in each question`;

    const systemPrompt = `You are an expert exam question analyzer. You have been given real past exam papers. Analyze them to identify patterns and predict future questions. Respond only with JSON.`;
    const userPrompt = buildPrompt(subject, examType, questionCount, context);

    let content = await generateText(systemPrompt, userPrompt);
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    let parsed;
    try { parsed = JSON.parse(content); }
    catch { return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' }); }

    const pyq = await PYQ.create({
      userId: req.userId,
      subject,
      syllabus: `[Extracted from PDF: ${req.file.originalname}]\n\n${truncated.slice(0, 500)}…`,
      examType,
      title: parsed.title || `PYQ Analysis: ${subject}`,
      questions: parsed.questions || [],
    });

    res.status(201).json(pyq);
  } catch (err) {
    console.error('PYQ PDF error:', err);
    res.status(500).json({ error: err.message });
  }
};

/* ── CRUD ── */

export const getPYQs = async (req, res) => {
  try {
    const pyqs = await PYQ.find({ userId: req.userId })
      .select('title subject examType questions createdAt')
      .sort({ createdAt: -1 });
    res.json(pyqs.map(p => ({
      _id: p._id, title: p.title, subject: p.subject,
      examType: p.examType, questionCount: p.questions.length,
      highImportance: p.questions.filter(q => q.importance === 'high').length,
      createdAt: p.createdAt,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getPYQ = async (req, res) => {
  try {
    const pyq = await PYQ.findOne({ _id: req.params.id, userId: req.userId });
    if (!pyq) return res.status(404).json({ error: 'Not found' });
    res.json(pyq);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deletePYQ = async (req, res) => {
  try {
    await PYQ.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
