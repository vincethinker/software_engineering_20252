const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  author:    { type: String, required: true },
  publisher: { type: String },
  price:     { type: Number, required: true },
  quantity:  { type: Number, default: 0 },
  status:    { type: String, enum: ['available', 'unavailable'], default: 'available' }
});

module.exports = mongoose.model('Book', bookSchema);
