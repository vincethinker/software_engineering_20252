const mongoose = require('mongoose');

const workingSpaceBookingSchema = new mongoose.Schema({
  customer_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  booking_date:     { type: Date, required: true },
  start_time:       { type: String, required: true },
  end_time:         { type: String, required: true },
  number_of_people: { type: Number, required: true },
  booking_status:   { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
});

module.exports = mongoose.model('WorkingSpaceBooking', workingSpaceBookingSchema);
