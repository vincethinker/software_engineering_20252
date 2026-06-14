const mongoose = require('mongoose');

const eventDrinkItemSchema = new mongoose.Schema({
  event_registration_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EventRegistration', required: true },
  drink_id:              { type: mongoose.Schema.Types.ObjectId, ref: 'DrinkProduct', required: true },
  quantity:              { type: Number, required: true },
  unit_price:            { type: Number, required: true }
});

module.exports = mongoose.model('EventDrinkItem', eventDrinkItemSchema);