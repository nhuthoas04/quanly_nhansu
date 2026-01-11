const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Vui lòng chọn nhân viên']
  },
  month: {
    type: Number,
    required: [true, 'Vui lòng chọn tháng'],
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: [true, 'Vui lòng chọn năm']
  },
  baseSalary: {
    type: Number,
    required: [true, 'Vui lòng nhập lương cơ bản'],
    default: 0
  },
  allowances: {
    food: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    phone: { type: Number, default: 0 },
    housing: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  totalAllowance: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  bonusNote: {
    type: String
  },
  deductions: {
    socialInsurance: { type: Number, default: 0 },
    healthInsurance: { type: Number, default: 0 },
    unemploymentInsurance: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  totalDeduction: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  overtimePay: {
    type: Number,
    default: 0
  },
  workingDays: {
    type: Number,
    default: 0
  },
  actualWorkingDays: {
    type: Number,
    default: 0
  },
  leaveDays: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Chờ duyệt', 'Đã duyệt', 'Đã thanh toán'],
    default: 'Chờ duyệt'
  },
  paidDate: {
    type: Date
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

// Calculate totals before save
salarySchema.pre('save', function (next) {
  // Calculate total allowance
  this.totalAllowance =
    (this.allowances.food || 0) +
    (this.allowances.transport || 0) +
    (this.allowances.phone || 0) +
    (this.allowances.housing || 0) +
    (this.allowances.other || 0);

  // Calculate total deduction
  this.totalDeduction =
    (this.deductions.socialInsurance || 0) +
    (this.deductions.healthInsurance || 0) +
    (this.deductions.unemploymentInsurance || 0) +
    (this.deductions.tax || 0) +
    (this.deductions.other || 0);

  // Calculate net salary
  this.netSalary =
    this.baseSalary +
    this.totalAllowance +
    this.bonus +
    this.overtimePay -
    this.totalDeduction;

  next();
});

// Compound index
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
