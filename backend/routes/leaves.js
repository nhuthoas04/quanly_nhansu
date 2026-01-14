const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { protect, authorize } = require('../middleware/auth');

// =============================================
// EMPLOYEE SELF-SERVICE ROUTES
// =============================================

// @route   GET /api/leaves/my-requests
// @desc    Get employee's own leave requests
// @access  Private (All roles)
router.get('/my-requests', protect, async (req, res) => {
  try {
    // Find employee linked to current user
    const user = await User.findById(req.user.id);
    if (!user.employee) {
      return res.status(400).json({ message: 'Tài khoản chưa được liên kết với nhân viên' });
    }

    const leaves = await Leave.find({ employee: user.employee })
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/leaves/my-request
// @desc    Employee creates their own leave request
// @access  Private (All roles)
router.post('/my-request', protect, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Find employee linked to current user
    const user = await User.findById(req.user.id);
    if (!user.employee) {
      return res.status(400).json({ message: 'Tài khoản chưa được liên kết với nhân viên' });
    }

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      employee: user.employee,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'Chờ duyệt'
    });

    res.status(201).json({ success: true, leave, message: 'Đã gửi đơn xin nghỉ phép' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/leaves/my-request/:id
// @desc    Employee updates their own pending leave request
// @access  Private (All roles)
router.put('/my-request/:id', protect, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const user = await User.findById(req.user.id);
    if (!user.employee) {
      return res.status(400).json({ message: 'Tài khoản chưa được liên kết với nhân viên' });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Không tìm thấy đơn xin nghỉ' });
    }

    // Check if this leave belongs to the employee
    if (leave.employee.toString() !== user.employee.toString()) {
      return res.status(403).json({ message: 'Không có quyền sửa đơn này' });
    }

    if (leave.status !== 'Chờ duyệt') {
      return res.status(400).json({ message: 'Chỉ có thể sửa đơn đang chờ duyệt' });
    }

    // Update fields
    if (leaveType) leave.leaveType = leaveType;
    if (startDate) leave.startDate = startDate;
    if (endDate) leave.endDate = endDate;
    if (reason) leave.reason = reason;

    // Recalculate total days
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      leave.totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    await leave.save();

    res.json({ success: true, leave, message: 'Đã cập nhật đơn xin nghỉ phép' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/leaves/my-request/:id
// @desc    Employee deletes their own pending leave request
// @access  Private (All roles)
router.delete('/my-request/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.employee) {
      return res.status(400).json({ message: 'Tài khoản chưa được liên kết với nhân viên' });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Không tìm thấy đơn xin nghỉ' });
    }

    // Check if this leave belongs to the employee
    if (leave.employee.toString() !== user.employee.toString()) {
      return res.status(403).json({ message: 'Không có quyền xóa đơn này' });
    }

    if (leave.status !== 'Chờ duyệt') {
      return res.status(400).json({ message: 'Chỉ có thể xóa đơn đang chờ duyệt' });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Đã xóa đơn xin nghỉ phép' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/leaves/my-request/:id/cancel
// @desc    Employee cancels their own pending leave request
// @access  Private (All roles)
router.put('/my-request/:id/cancel', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.employee) {
      return res.status(400).json({ message: 'Tài khoản chưa được liên kết với nhân viên' });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Không tìm thấy đơn xin nghỉ' });
    }

    // Check if this leave belongs to the employee
    if (leave.employee.toString() !== user.employee.toString()) {
      return res.status(403).json({ message: 'Không có quyền hủy đơn này' });
    }

    if (leave.status !== 'Chờ duyệt') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn đang chờ duyệt' });
    }

    leave.status = 'Đã hủy';
    await leave.save();

    res.json({ success: true, message: 'Đã hủy đơn xin nghỉ phép' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================================
// ADMIN/MANAGER ROUTES
// =============================================

// @route   GET /api/leaves
// @desc    Get all leave requests
// @access  Private/Admin/Manager
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { page = 1, limit = 10, employee, status, leaveType } = req.query;

    const query = {};

    if (employee) query.employee = employee;
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate('employee', 'fullName employeeId department')
      .populate('approvedBy', 'fullName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Leave.countDocuments(query);

    res.json({
      success: true,
      leaves,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/leaves/:id
// @desc    Get leave by ID
// @access  Private/Admin/HR/Manager
router.get('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee')
      .populate('approvedBy');

    if (!leave) {
      return res.status(404).json({ message: 'Không tìm thấy đơn xin nghỉ' });
    }

    res.json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/leaves
// @desc    Create leave request
// @access  Private/Admin/HR/Manager
router.post('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const leave = await Leave.create(req.body);
    res.status(201).json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/leaves/:id/approve
// @desc    Approve leave request
// @access  Private/Admin/HR/Manager
router.put('/:id/approve', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Không tìm thấy đơn xin nghỉ' });
    }

    if (leave.status !== 'Chờ duyệt') {
      return res.status(400).json({ message: 'Đơn này đã được xử lý' });
    }

    leave.status = 'Đã duyệt';
    leave.approvedBy = req.user.id;
    leave.approvedDate = new Date();
    await leave.save();

    res.json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/leaves/:id/reject
// @desc    Reject leave request
// @access  Private/Admin/HR/Manager
router.put('/:id/reject', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { rejectReason } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Không tìm thấy đơn xin nghỉ' });
    }

    if (leave.status !== 'Chờ duyệt') {
      return res.status(400).json({ message: 'Đơn này đã được xử lý' });
    }

    leave.status = 'Từ chối';
    leave.rejectReason = rejectReason;
    leave.approvedBy = req.user.id;
    leave.approvedDate = new Date();
    await leave.save();

    res.json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/leaves/:id
// @desc    Update leave request
// @access  Private/Admin/HR/Manager
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Không tìm thấy đơn xin nghỉ' });
    }

    if (leave.status !== 'Chờ duyệt') {
      return res.status(400).json({ message: 'Không thể sửa đơn đã được xử lý' });
    }

    Object.assign(leave, req.body);
    await leave.save();

    res.json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/leaves/:id
// @desc    Delete leave request
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Không tìm thấy đơn xin nghỉ' });
    }

    res.json({ success: true, message: 'Đã xóa đơn xin nghỉ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
