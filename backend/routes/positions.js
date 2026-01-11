const express = require('express');
const router = express.Router();
const Position = require('../models/Position');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/positions
// @desc    Get all positions
// @access  Private/Admin/HR/Manager
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const positions = await Position.find()
      .sort({ name: 1 });

    res.json({ success: true, positions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/positions/:id
// @desc    Get position by ID
// @access  Private/Admin/HR/Manager
router.get('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);

    if (!position) {
      return res.status(404).json({ message: 'Không tìm thấy chức vụ' });
    }

    res.json({ success: true, position });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/positions
// @desc    Create position
// @access  Private/Admin/HR
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const position = await Position.create(req.body);
    res.status(201).json({ success: true, position });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/positions/:id
// @desc    Update position
// @access  Private/Admin/HR
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const position = await Position.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!position) {
      return res.status(404).json({ message: 'Không tìm thấy chức vụ' });
    }

    res.json({ success: true, position });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/positions/:id
// @desc    Delete position
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const position = await Position.findByIdAndDelete(req.params.id);

    if (!position) {
      return res.status(404).json({ message: 'Không tìm thấy chức vụ' });
    }

    res.json({ success: true, message: 'Đã xóa chức vụ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
