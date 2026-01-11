const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Vui lòng chọn nhân viên']
  },
  leaveType: {
    type: String,
    enum: ['Nghỉ phép năm', 'Nghỉ ốm', 'Nghỉ không lương', 'Nghỉ cưới', 'Nghỉ tang', 'Nghỉ thai sản', 'Khác'],
    required: [true, 'Vui lòng chọn loại nghỉ phép']
  },
  startDate: {
    type: Date,
    required: [true, 'Vui lòng chọn ngày bắt đầu']
  },
  endDate: {
    type: Date,
    required: [true, 'Vui lòng chọn ngày kết thúc']
  },
  totalDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Vui lòng nhập lý do']
  },
  status: {
    type: String,
    enum: ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã hủy'],
    default: 'Chờ duyệt'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  },
  rejectReason: {
    type: String
  },
  attachments: [{
    type: String
  }]
}, {
  timestamps: true
});

// Calculate total days before save
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diff = this.endDate - this.startDate;
    this.totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);
