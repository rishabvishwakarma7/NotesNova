import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  folderName: { type: String, required: true },
  parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  color: { type: String, default: '#8B5CF6' },
}, { timestamps: true });

export default mongoose.model('Folder', folderSchema);
