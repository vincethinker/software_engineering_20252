const mongoose = require('mongoose');

const eventSnackItemSchema = new mongoose.Schema({
  event_registration_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EventRegistration', required: true },
  snack_id:              { type: mongoose.Schema.Types.ObjectId, ref: 'SnackProduct', required: true },
  quantity:              { type: Number, required: true },
  unit_price:            { type: Number, required: true }
});

module.exports = mongoose.model('EventSnackItem', eventSnackItemSchema);