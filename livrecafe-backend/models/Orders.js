const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: { 
          type: Number, 
          required: true,
          min: 1
        },
        price: { 
          type: Number, 
          required: true 
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["Chờ thanh toán", "Đơn hàng mới", "Đang xử lý", "Đang giao", "Hoàn thành", "Hủy"],
      default: "Đơn hàng mới"
    }   
},{timestamps: true})

module.exports = mongoose.model('Order', orderSchema);