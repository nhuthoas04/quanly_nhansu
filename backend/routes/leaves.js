const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/leaves
// @desc    Get all leave requests
// @access  Private/Admin/HR/Manager
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
