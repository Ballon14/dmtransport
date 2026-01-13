import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['mobil', 'motor'],
    required: true,
  },
  category: {
    type: String,
    required: true,
    // Mobil: MPV, SUV, City Car, Hatchback, LCGC
    // Motor: Matic, Sport, Adventure
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  specs: [{
    type: String,
  }],
  description: {
    type: String,
    default: '',
  },
  available: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
