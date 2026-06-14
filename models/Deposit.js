const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  event_registration_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EventRegistration', required: true },
  deposit_amount:        { type: Number, required: true },
  payment_method:        { type: String, default: 'bank transfer' },
  deposit_status:        { type: String, enum: ['pending', 'received', 'confirmed'], default: 'pending' },
  deposit_date:          { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deposit', depositSchema);