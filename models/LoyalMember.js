const mongoose = require('mongoose');

const loyalMemberSchema = new mongoose.Schema({
  customer_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true },
  tier:          { type: String, enum: ['Đồng', 'Bạc', 'Vàng', 'Kim Cương'], default: 'Đồng' },
  total_points:  { type: Number, default: 0 },
  register_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoyalMember', loyalMemberSchema);