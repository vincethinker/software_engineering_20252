const mongoose = require('mongoose');

const cafeOrderSchema = new mongoose.Schema({
  customer_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  order_date:   { type: Date, default: Date.now },
  order_type:   { type: String, enum: ['dine-in', 'takeaway', 'delivery'], default: 'dine-in' },
  order_status: { type: String, enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'], default: 'pending' },
  total_amount: { type: Number, default: 0 }
});

module.exports = mongoose.model('CafeOrder', cafeOrderSchema);
