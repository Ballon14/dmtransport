import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  
  // Vehicle reference
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  vehicleName: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    default: '',
  },
  
  // Customer info
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  customerAddress: {
    type: String,
    default: '',
  },
  
  // Rental period
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  
  // Pricing
  pricePerDay: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'],
    default: 'pending',
  },
  
  // Payment info (Midtrans)
  orderId: {
    type: String,
    unique: true,
    sparse: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'expired', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    default: '',
  },
  transactionId: {
    type: String,
    default: '',
  },
  transactionTime: {
    type: Date,
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  snapToken: {
    type: String,
    default: '',
  },
  snapRedirectUrl: {
    type: String,
    default: '',
  },
  
  // Additional info
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Generate orderId before saving
BookingSchema.pre('save', function() {
  if (!this.orderId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderId = `DMT-${timestamp}-${random}`;
  }
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
