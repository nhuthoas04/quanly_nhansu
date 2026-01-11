const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/contracts
// @desc    Get all contracts
// @access  Private/Admin/HR/Manager
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { page = 1, limit = 10, employee, status, contractType } = req.query;
    
    const query = {};
    
    if (employee) query.employee = employee;
    if (status) query.status = status;
    if (contractType) query.contractType = contractType;

    const contracts = await Contract.find(query)
      .populate('employee', 'fullName employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Contract.countDocuments(query);

    res.json({
      success: true,
      contracts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/contracts/:id
// @desc    Get contract by ID
// @access  Private/Admin/HR/Manager
router.get('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('employee');

    if (!contract) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }

    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/contracts
// @desc    Create contract
// @access  Private/Admin/HR
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    // Auto-generate contract number (HD001, HD002, HD003...)
    const lastContract = await Contract.findOne().sort({ contractNumber: -1 });
    let newContractNumber = 'HD001';
    
    if (lastContract && lastContract.contractNumber) {
      const lastNumber = parseInt(lastContract.contractNumber.substring(2));
      const newNumber = lastNumber + 1;
      newContractNumber = 'HD' + String(newNumber).padStart(3, '0');
    }
    
    const contract = await Contract.create({
      ...req.body,
      contractNumber: newContractNumber
    });
    
    res.status(201).json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/contracts/:id/sign
// @desc    Sign contract
// @access  Private/Admin/HR
router.put('/:id/sign', protect, authorize('admin'), async (req, res) => {
  try {
    const { signedBy } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }

    contract.status = 'Hiệu lực';
    contract.signedDate = new Date();
    contract.signedBy = signedBy;
    await contract.save();

    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/contracts/:id
// @desc    Update contract
// @access  Private/Admin/HR
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!contract) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }

    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/contracts/:id/status
// @desc    Update contract status
// @access  Private/Admin/HR
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }

    contract.status = status;
    await contract.save();

    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/contracts/:id
// @desc    Delete contract
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }

    res.json({ success: true, message: 'Đã xóa hợp đồng' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
