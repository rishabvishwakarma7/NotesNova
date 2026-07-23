import Folder from '../models/Folder.js';

export const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.userId }).sort({ folderName: 1 });
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createFolder = async (req, res) => {
  try {
    const folder = await Folder.create({ userId: req.userId, ...req.body });
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFolder = async (req, res) => {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    res.json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    await Folder.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Folder deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
