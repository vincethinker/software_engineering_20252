const mongoose = require('mongoose');

const drinkOrderDetailSchema = new mongoose.Schema({
  order_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'CafeOrder',    required: true },
  drink_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'DrinkProduct', required: true },
  quantity:   { type: Number, required: true },
  unit_price: { type: Number, required: true }
});

module.exports = mongoose.model('DrinkOrderDetail', drinkOrderDetailSchema);
