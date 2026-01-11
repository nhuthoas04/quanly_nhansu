const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Vui lòng chọn nhân viên']
  },
  date: {
    type: Date,
    required: [true, 'Vui lòng chọn ngày']
  },
  checkIn: {
    type: String
  },
  checkOut: {
    type: String
  },
  status: {
    type: String,
    enum: ['Có mặt', 'Vắng mặt', 'Đi muộn', 'Về sớm', 'Nghỉ phép', 'Công tác', 'Làm việc từ xa'],
    default: 'Có mặt'
  },
  workHours: {
    type: Number,
    default: 0
  },
  overtime: {
    type: Number,
    default: 0
  },
  note: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate work hours before save
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    // Parse time strings (HH:MM format)
    const [checkInHour, checkInMinute] = this.checkIn.split(':').map(Number);
    const [checkOutHour, checkOutMinute] = this.checkOut.split(':').map(Number);
    
    // Calculate total minutes
    const checkInMinutes = checkInHour * 60 + checkInMinute;
    const checkOutMinutes = checkOutHour * 60 + checkOutMinute;
    
    // Calculate work hours
    const diffMinutes = checkOutMinutes - checkInMinutes;
    this.workHours = Math.round((diffMinutes / 60) * 100) / 100;
    
    // Calculate overtime (over 8 hours)
    if (this.workHours > 8) {
      this.overtime = this.workHours - 8;
    }
  }
  next();
});

// Compound index for employee and date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
