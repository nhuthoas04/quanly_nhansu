const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Position = require('../models/Position');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/employees
// @desc    Get all employees
// @access  Private/Admin/HR/Manager
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, position, status } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) query.department = department;
    if (position) query.position = position;
    if (status) query.status = status;

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .populate('position', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Employee.countDocuments(query);

    res.json({
      success: true,
      employees,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Private/Admin/HR/Manager
router.get('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department')
      .populate('position');

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    res.json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/employees
// @desc    Create employee and auto-create user account based on position
// @access  Private/Admin/HR
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    // Get position for employee ID prefix and role mapping
    const position = await Position.findById(req.body.position);
    if (!position) {
      return res.status(400).json({ message: 'Chức vụ không tồn tại' });
    }

    const positionCode = position.code; // VD: TP, NV, GD...
    const positionName = position.name.toLowerCase();

    // Find last employee with this position code
    const lastEmployee = await Employee.findOne({
      employeeId: new RegExp(`^${positionCode}`)
    }).sort({ employeeId: -1 });

    let newEmployeeId = `${positionCode}001`;

    if (lastEmployee && lastEmployee.employeeId) {
      const lastNumber = parseInt(lastEmployee.employeeId.substring(positionCode.length));
      const newNumber = lastNumber + 1;
      newEmployeeId = positionCode + String(newNumber).padStart(3, '0');
    }

    // Create employee
    const employee = await Employee.create({
      ...req.body,
      employeeId: newEmployeeId
    });

    // Auto-map position to role
    let userRole = 'employee'; // Default

    // Mapping chức vụ -> role
    if (positionName.includes('giám đốc') || positionName.includes('director')) {
      userRole = 'admin';
    } else if (positionName.includes('trưởng phòng') || positionName.includes('quản lý') || positionName.includes('manager')) {
      userRole = 'manager';
    } else {
      userRole = 'employee'; // Nhân viên, Thực tập sinh, etc.
    }

    // Allow manual override if provided
    if (req.body.userRole) {
      userRole = req.body.userRole;
    }

    // Password: use input or default
    const password = req.body.password || 'nhanvien123';

    let userAccount = null;
    let userError = null;
    try {
      userAccount = await User.create({
        username: newEmployeeId.toLowerCase(), // Use employeeId as username
        email: req.body.email,
        password: password,
        fullName: req.body.fullName,
        role: userRole,
        employee: employee._id
      });
    } catch (err) {
      // If user creation fails (e.g., email exists), continue but log the error
      console.log('Không thể tạo tài khoản tự động:', err.message);
      userError = err.message;
    }

    // Auto-create 3-month contract for interns (thực tập sinh)
    let contract = null;
    if (positionName.includes('thực tập') || positionName.includes('intern')) {
      const Contract = require('../models/Contract');

      // Calculate dates
      const startDate = new Date(req.body.hireDate || new Date());
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3); // 3 months contract

      // Generate contract number
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const contractCount = await Contract.countDocuments() + 1;
      const contractNumber = `HD-TT-${year}${month}-${String(contractCount).padStart(4, '0')}`;

      try {
        contract = await Contract.create({
          employee: employee._id,
          contractNumber: contractNumber,
          contractType: 'Thử việc',
          startDate: startDate,
          endDate: endDate,
          salary: req.body.baseSalary || position.baseSalary || 5000000,
          status: 'Hiệu lực',
          note: `Hợp đồng thực tập 3 tháng - Tự động tạo khi thêm nhân viên ${employee.fullName}`
        });
      } catch (contractError) {
        console.log('Không thể tạo hợp đồng tự động:', contractError.message);
      }
    }

    res.status(201).json({
      success: true,
      employee,
      userAccount: userAccount ? {
        username: userAccount.username,
        email: userAccount.email,
        role: userAccount.role,
        message: 'Tài khoản đã được tạo tự động. Vui lòng đổi mật khẩu sau khi đăng nhập.'
      } : null,
      userError: userError || null,
      contract: contract ? {
        contractNumber: contract.contractNumber,
        contractType: contract.contractType,
        startDate: contract.startDate,
        endDate: contract.endDate,
        salary: contract.salary,
        message: 'Hợp đồng thực tập 3 tháng đã được tạo tự động.'
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee and sync with User account
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Get old employee data to compare
    const oldEmployee = await Employee.findById(req.params.id);
    if (!oldEmployee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    // Clean up data - remove empty department for executive positions
    const updateData = { ...req.body };
    if (!updateData.department || updateData.department === '') {
      // Check if position is executive (no department needed)
      const positionToCheck = await Position.findById(updateData.position || oldEmployee.position);
      if (positionToCheck) {
        const posName = positionToCheck.name.toLowerCase();
        if (posName.includes('giám đốc') || posName.includes('director') || posName.includes('phó giám đốc')) {
          updateData.department = null; // Set to null for executive positions
        }
      }
    }

    // Update employee
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Sync with User account if exists
    let userUpdateResult = null;
    const userAccount = await User.findOne({ employee: req.params.id });

    if (userAccount) {
      const userUpdates = {};

      // Sync fullName
      if (req.body.fullName && req.body.fullName !== oldEmployee.fullName) {
        userUpdates.fullName = req.body.fullName;
      }

      // Sync email
      if (req.body.email && req.body.email !== oldEmployee.email) {
        userUpdates.email = req.body.email;
      }

      // Sync role if position changed
      const newPosId = req.body.position ? req.body.position.toString() : null;
      const oldPosId = oldEmployee.position ? oldEmployee.position.toString() : null;

      if (newPosId && newPosId !== oldPosId) {
        const newPosition = await Position.findById(req.body.position);
        if (newPosition) {
          const positionName = newPosition.name.toLowerCase();
          let newRole = 'employee';

          if (positionName.includes('giám đốc') || positionName.includes('director')) {
            newRole = 'admin';
          } else if (positionName.includes('trưởng phòng') || positionName.includes('quản lý') || positionName.includes('manager')) {
            newRole = 'manager';
          }

          userUpdates.role = newRole;
        }
      }

      // Apply updates if any
      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(userAccount._id, userUpdates);
        userUpdateResult = userUpdates;
      }
    }

    res.json({
      success: true,
      employee,
      userSynced: userUpdateResult ? {
        message: 'Tài khoản đã được cập nhật theo',
        updates: userUpdateResult
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee and all related data (cascade delete)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    // Import related models for cascade delete
    const Attendance = require('../models/Attendance');
    const Leave = require('../models/Leave');
    const Salary = require('../models/Salary');
    const Contract = require('../models/Contract');

    // Delete all related data
    const [attendanceResult, leaveResult, salaryResult, contractResult, userResult] = await Promise.all([
      Attendance.deleteMany({ employee: req.params.id }),
      Leave.deleteMany({ employee: req.params.id }),
      Salary.deleteMany({ employee: req.params.id }),
      Contract.deleteMany({ employee: req.params.id }),
      User.deleteMany({ employee: req.params.id })
    ]);

    // Delete the employee
    await Employee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Đã xóa nhân viên và tất cả dữ liệu liên quan',
      deletedRecords: {
        attendance: attendanceResult.deletedCount,
        leaves: leaveResult.deletedCount,
        salaries: salaryResult.deletedCount,
        contracts: contractResult.deletedCount,
        users: userResult.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
