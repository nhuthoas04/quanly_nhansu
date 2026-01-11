const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Vui lòng nhập mã nhân viên'],
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Vui lòng nhập số điện thoại']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày sinh']
  },
  gender: {
    type: String,
    enum: ['Nam', 'Nữ', 'Khác'],
    required: [true, 'Vui lòng chọn giới tính']
  },
  address: {
    type: String,
    required: [true, 'Vui lòng nhập địa chỉ']
  },
  identityCard: {
    type: String,
    required: [true, 'Vui lòng nhập CMND/CCCD'],
    unique: true,
    validate: {
      validator: function (v) {
        return /^[0-9]+$/.test(v);
      },
      message: 'CMND/CCCD phải là số'
    }
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false // Optional for executive positions (Giám đốc, Phó GĐ)
  },
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: [true, 'Vui lòng chọn chức vụ']
  },
  hireDate: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày vào làm']
  },
  status: {
    type: String,
    enum: ['Đang làm việc', 'Đã nghỉ việc', 'Tạm nghỉ'],
    default: 'Đang làm việc'
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  education: {
    type: String,
    enum: ['Trung cấp', 'Cao đẳng', 'Đại học', 'Thạc sĩ', 'Tiến sĩ', 'Khác'],
    default: 'Đại học'
  },
  bankAccount: {
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  baseSalary: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
