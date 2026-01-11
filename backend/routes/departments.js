const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private/Admin/HR/Manager
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('manager', 'fullName')
      .populate('employeeCount')
      .sort({ name: 1 });

    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/departments/:id
// @desc    Get department by ID
// @access  Private/Admin/HR/Manager
router.get('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const Employee = require('../models/Employee');
    
    const department = await Department.findById(req.params.id)
      .populate('manager');

    if (!department) {
      return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    }

    // Get all employees in this department
    const employees = await Employee.find({ department: req.params.id })
      .populate('position')
      .select('employeeId fullName email phone position status')
      .sort({ employeeId: 1 });

    res.json({ success: true, department, employees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/departments
// @desc    Create department
// @access  Private/Admin/HR
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private/Admin/HR
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    }

    res.json({ success: true, department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    }

    res.json({ success: true, message: 'Đã xóa phòng ban' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
