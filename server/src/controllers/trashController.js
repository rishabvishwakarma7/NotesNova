import Note from '../models/Note.js';
import Chat from '../models/Chat.js';
import Quiz from '../models/Quiz.js';

// Get all trashed items
export const getTrashItems = async (req, res) => {
  try {
    const userId = req.userId;
    const [notes, chats, quizzes] = await Promise.all([
      Note.find({ userId, isDeleted: true }).select('title subject noteType deletedAt createdAt').sort({ deletedAt: -1 }),
      Chat.find({ userId, isDeleted: true }).select('title mode deletedAt createdAt').sort({ deletedAt: -1 }),
      Quiz.find({ userId, isDeleted: true }).select('title subject difficulty deletedAt createdAt').sort({ deletedAt: -1 }),
    ]);

    const items = [
      ...notes.map((n) => ({ type: 'note', id: n._id, title: n.title, meta: n.subject || n.noteType, deletedAt: n.deletedAt })),
      ...chats.map((c) => ({ type: 'chat', id: c._id, title: c.title, meta: c.mode, deletedAt: c.deletedAt })),
      ...quizzes.map((q) => ({ type: 'quiz', id: q._id, title: q.title, meta: q.difficulty, deletedAt: q.deletedAt })),
    ].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

    res.json({ items, count: items.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Restore item from trash
export const restoreTrashItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.userId;

    let model;
    if (type === 'note') model = Note;
    else if (type === 'chat') model = Chat;
    else if (type === 'quiz') model = Quiz;
    else return res.status(400).json({ error: 'Invalid item type' });

    const item = await model.findOneAndUpdate(
      { _id: id, userId, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!item) return res.status(404).json({ error: 'Item not found in trash' });
    res.json({ message: 'Item restored successfully', item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Permanently delete item
export const permanentDeleteItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.userId;

    let model;
    if (type === 'note') model = Note;
    else if (type === 'chat') model = Chat;
    else if (type === 'quiz') model = Quiz;
    else return res.status(400).json({ error: 'Invalid item type' });

    const result = await model.findOneAndDelete({ _id: id, userId, isDeleted: true });
    if (!result) return res.status(404).json({ error: 'Item not found in trash' });

    res.json({ message: 'Item permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Empty entire trash
export const emptyTrash = async (req, res) => {
  try {
    const userId = req.userId;
    await Promise.all([
      Note.deleteMany({ userId, isDeleted: true }),
      Chat.deleteMany({ userId, isDeleted: true }),
      Quiz.deleteMany({ userId, isDeleted: true }),
    ]);
    res.json({ message: 'Trash emptied successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
