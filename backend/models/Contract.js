const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Vui lòng chọn nhân viên']
  },
  contractNumber: {
    type: String,
    required: [true, 'Vui lòng nhập số hợp đồng'],
    unique: true
  },
  contractType: {
    type: String,
    enum: ['Thử việc', 'Có thời hạn', 'Không thời hạn', 'Thời vụ', 'Hợp tác'],
    required: [true, 'Vui lòng chọn loại hợp đồng']
  },
  startDate: {
    type: Date,
    required: [true, 'Vui lòng chọn ngày bắt đầu']
  },
  endDate: {
    type: Date
  },
  salary: {
    type: Number,
    required: [true, 'Vui lòng nhập mức lương']
  },
  status: {
    type: String,
    enum: ['Hiệu lực', 'Hết hạn', 'Đã hủy', 'Chờ ký'],
    default: 'Chờ ký'
  },
  note: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contract', contractSchema);
