const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  customer_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  event_name:          { type: String, required: true },
  event_date:          { type: Date, required: true },
  start_time:          { type: String, required: true },
  end_time:            { type: String, required: true },
  participant_count:   { type: Number, required: true },
  quotation_amount:    { type: Number, default: 0 },
  registration_status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
});

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);