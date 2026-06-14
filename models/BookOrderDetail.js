const mongoose = require('mongoose');

const bookOrderDetailSchema = new mongoose.Schema({
  order_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'CafeOrder', required: true },
  book_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Book',      required: true },
  quantity:   { type: Number, required: true },
  unit_price: { type: Number, required: true }
});

module.exports = mongoose.model('BookOrderDetail', bookOrderDetailSchema);
