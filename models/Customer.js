const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  full_name:  { type: String, required: true },
  phone:      { type: String, required: true },
  email:      { type: String },
  address:    { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);
