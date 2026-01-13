import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: null, // Clerk user ID, null untuk guest
  },
  guestName: {
    type: String,
    default: '',
  },
  guestEmail: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  },
  lastMessage: {
    type: String,
    default: '',
  },
  unreadCount: {
    type: Number,
    default: 0, // Jumlah pesan belum dibaca oleh admin
  },
}, {
  timestamps: true,
});

// Index untuk query yang sering digunakan
ChatSessionSchema.index({ status: 1, updatedAt: -1 });
ChatSessionSchema.index({ userId: 1 });

export default mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);
