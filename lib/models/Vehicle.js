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
  // Motor pricing
  priceInCity: {
    type: Number,
    default: 0, // Price per day for in-city (dalam kota)
  },
  priceOutCity: {
    type: Number,
    default: 0, // Price per day for out-of-city (luar kota)
  },
  // Mobil pricing
  price12h: {
    type: Number,
    default: 0, // Price per 12 hours (for mobil)
  },
  price24h: {
    type: Number,
    default: 0, // Price per 24 hours (for mobil)
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
