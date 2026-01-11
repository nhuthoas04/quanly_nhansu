const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên chức vụ'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Vui lòng nhập mã chức vụ'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String
  },
  baseSalary: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Position', positionSchema);
