import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer',
  },
  imageUrl: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Prevent model recompilation error in development
export default mongoose.models.User || mongoose.model('User', UserSchema);
