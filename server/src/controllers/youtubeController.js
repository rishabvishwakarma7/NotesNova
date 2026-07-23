import { generateText } from '../config/gemini.js';
import { YoutubeTranscript } from 'youtube-transcript';

const NOTE_TYPE_PROMPTS = {
  detailed: 'Generate comprehensive, detailed study notes from this video transcript. Include definitions, explanations, examples, and key takeaways. Use markdown headings, bold for key terms, and organized sections.',
  short: 'Generate concise short notes from this video transcript. Focus on key points only. Use bullet points and brief explanations.',
  bullet: 'Generate bullet-point notes from this video transcript. Each point should be a single, clear statement. Group related points under subheadings.',
  exam: 'Generate exam-oriented notes from this video transcript. Focus on frequently asked questions, important definitions, formulas, and key concepts. Include potential exam questions.',
  revision: 'Generate a quick revision sheet from this video transcript. Summarize the most critical points in the shortest form possible. Use tables, lists, and highlighted terms.',
  definitions: 'Generate a list of important definitions and terms mentioned in this video transcript. Each definition should be clear and concise.',
  viva: 'Generate likely viva/oral exam questions with brief, structured answers based on this video transcript.',
  mcq: 'Generate 10 multiple choice questions based on this video transcript. Include 4 options each with the correct answer marked.',
  flashcards: 'Generate 15 flashcards based on this video transcript. Format each as:\n**Q:** [question]\n**A:** [concise answer]\n\nSeparate each flashcard with a horizontal rule (---). Cover key terms, concepts, and facts from the video.',
};

/**
 * Extracts a YouTube video ID from various URL formats.
 */
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export const generateVideoNotes = async (req, res) => {
  try {
    const { url, type = 'detailed', subject = '' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL. Please paste a valid YouTube video link.' });
    }

    // Fetch the transcript
    let transcriptItems;
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (transcriptErr) {
      console.error('Transcript fetch error:', transcriptErr);
      return res.status(400).json({
        error: 'Could not fetch transcript for this video. The video may not have captions/subtitles enabled, or it may be private/restricted.',
      });
    }

    if (!transcriptItems || transcriptItems.length === 0) {
      return res.status(400).json({ error: 'No transcript available for this video.' });
    }

    // Combine transcript text
    const fullTranscript = transcriptItems.map(item => item.text).join(' ');

    // Truncate if very long (Gemini has large context but keep it reasonable)
    const maxChars = 60000;
    const transcript = fullTranscript.length > maxChars
      ? fullTranscript.slice(0, maxChars) + '\n\n[Transcript truncated due to length]'
      : fullTranscript;

    const prompt = NOTE_TYPE_PROMPTS[type] || NOTE_TYPE_PROMPTS.detailed;
    const subjectContext = subject ? ` The video is related to the subject: ${subject}.` : '';

    const systemPrompt = `You are NoteNova AI, a study notes generator. ${prompt} Structure the notes clearly with proper headings, subheadings, and formatting. Make the notes comprehensive and useful for exam preparation.${subjectContext}`;
    const userPrompt = `Generate study notes from the following YouTube video transcript:\n\n${transcript}`;

    const content = await generateText(systemPrompt, userPrompt);
    res.json({ content, videoId, type });
  } catch (err) {
    console.error('Video notes error:', err);
    res.status(500).json({ error: err.message });
  }
};
