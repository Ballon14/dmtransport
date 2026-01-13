import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
  },
  sender: {
    type: String,
    enum: ['customer', 'admin'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index untuk query pesan berdasarkan session
ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
