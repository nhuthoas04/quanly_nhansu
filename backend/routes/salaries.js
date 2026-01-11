const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/salaries
// @desc    Get all salary records
// @access  Private/Admin/HR
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, employee, month, year, status } = req.query;

    const query = {};

    if (employee) query.employee = employee;
    if (month) query.month = month;
    if (year) query.year = year;
    if (status) query.status = status;

    const salaries = await Salary.find(query)
      .populate('employee', 'fullName employeeId department')
      .populate('approvedBy', 'fullName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ year: -1, month: -1 });

    const count = await Salary.countDocuments(query);

    res.json({
      success: true,
      salaries,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/salaries/my-salary
// @desc    Get my salary records
// @access  Private
router.get('/my-salary', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { employee: req.user.employee };

    if (month) query.month = month;
    if (year) query.year = year;

    const salaries = await Salary.find(query)
      .populate('employee', 'fullName employeeId')
      .sort({ year: -1, month: -1 });

    res.json({ success: true, salaries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/salaries/check-exist
// @desc    Check if salary record exists
// @access  Private/Admin/HR
router.get('/check-exist', protect, authorize('admin'), async (req, res) => {
  try {
    const { employee, month, year } = req.query;

    const exists = await Salary.findOne({
      employee,
      month: parseInt(month),
      year: parseInt(year)
    });

    res.json({
      success: true,
      exists: !!exists
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/salaries/:id
// @desc    Get salary by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id)
      .populate('employee')
      .populate('approvedBy');

    if (!salary) {
      return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
    }

    // Check permission
    if (req.user.role !== 'admin' && 
      salary.employee._id.toString() !== req.user.employee?.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/salaries
// @desc    Create salary record
// @access  Private/Admin/HR
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const salary = await Salary.create(req.body);
    res.status(201).json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/salaries/:id
// @desc    Update salary record
// @access  Private/Admin/HR
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!salary) {
      return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
    }

    res.json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/salaries/:id/status
// @desc    Update salary status
// @access  Private/Admin/HR
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
    }

    salary.status = status;
    if (status === 'Đã thanh toán') {
      salary.paidDate = new Date();
    }
    if (status === 'Đã duyệt' && !salary.approvedBy) {
      salary.approvedBy = req.user.id;
    }
    await salary.save();

    res.json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/salaries/:id/approve
// @desc    Approve salary
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
    }

    salary.status = 'Đã duyệt';
    salary.approvedBy = req.user.id;
    await salary.save();

    res.json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/salaries/:id/pay
// @desc    Mark salary as paid
// @access  Private/Admin
router.put('/:id/pay', protect, authorize('admin'), async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
    }

    if (salary.status !== 'Đã duyệt') {
      return res.status(400).json({ message: 'Bảng lương chưa được duyệt' });
    }

    salary.status = 'Đã thanh toán';
    salary.paidDate = new Date();
    await salary.save();

    res.json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/salaries/:id
// @desc    Update salary
// @access  Private/Admin/HR
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!salary) {
      return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
    }

    res.json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/salaries/:id
// @desc    Delete salary
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);

    if (!salary) {
      return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
    }

    res.json({ success: true, message: 'Đã xóa bảng lương' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
