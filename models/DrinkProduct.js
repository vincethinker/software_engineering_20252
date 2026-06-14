const mongoose = require('mongoose');

const drinkSchema = new mongoose.Schema({
  drink_name: { type: String, required: true },
  category:   { type: String },
  price:      { type: Number, required: true },
  quantity:   { type: Number, default: 0 },
  status:     { type: String, enum: ['available', 'unavailable'], default: 'available' }
});

module.exports = mongoose.model('DrinkProduct', drinkSchema);
