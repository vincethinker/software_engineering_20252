const mongoose = require('mongoose');

const snackSchema = new mongoose.Schema({
  snack_name: { type: String, required: true },
  price:      { type: Number, required: true },
  quantity:   { type: Number, default: 0 },
  status:     { type: String, enum: ['available', 'unavailable'], default: 'available' }
});

module.exports = mongoose.model('SnackProduct', snackSchema);
