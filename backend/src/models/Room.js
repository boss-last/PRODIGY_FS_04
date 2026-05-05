import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  description: { type: String, default: '', maxlength: 200 },
  type: { type: String, enum: ['public', 'private'], default: 'public' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  topic: { type: String, default: '', maxlength: 100 },
  isSystem: { type: Boolean, default: false }
}, { timestamps: true });

roomSchema.index({ type: 1 });
roomSchema.index({ members: 1 });

export default mongoose.model('Room', roomSchema);
