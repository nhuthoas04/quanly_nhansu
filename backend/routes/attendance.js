const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

// Helper function to get Vietnam time (UTC+7)
const getVietnamTime = () => {
  const now = new Date();
  // Convert to Vietnam timezone
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  return vietnamTime;
};

// Get time string in HH:MM format for Vietnam timezone
const getVietnamTimeString = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// @route   GET /api/attendance
// @desc    Get all attendance records
// @access  Private/Admin/HR/Manager
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { page = 1, limit = 10, employee, startDate, endDate, status, month, year } = req.query;

    const query = {};

    if (employee) query.employee = employee;
    if (status) query.status = status;

    // Handle month and year filters
    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = {
        $gte: startOfMonth,
        $lte: endOfMonth
      };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'fullName employeeId department')
      .populate('approvedBy', 'fullName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const count = await Attendance.countDocuments(query);

    res.json({
      success: true,
      attendance,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================================
// SELF-SERVICE CHECK-IN/CHECK-OUT FOR EMPLOYEES
// MUST BE BEFORE /:id ROUTE!
// =============================================

// @route   GET /api/attendance/my-today
// @desc    Get my today's attendance
// @access  Private (all logged-in users)
router.get('/my-today', protect, async (req, res) => {
  try {
    if (!req.user.employee) {
      // Return canCheckIn = false for admin/non-employee accounts
      return res.json({
        success: true,
        attendance: null,
        canCheckIn: false,
        canCheckOut: false,
        message: 'Tài khoản không liên kết với nhân viên'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      employee: req.user.employee,
      date: { $gte: today, $lt: tomorrow }
    });

    res.json({
      success: true,
      attendance,
      canCheckIn: !attendance,
      canCheckOut: attendance && !attendance.checkOut
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance/my-history
// @desc    Get my attendance history
// @access  Private (all logged-in users with employee linked)
router.get('/my-history', protect, async (req, res) => {
  try {
    if (!req.user.employee) {
      return res.json({
        success: true,
        attendance: [],
        message: 'Tài khoản không liên kết với nhân viên'
      });
    }

    const { month, year, page = 1, limit = 31 } = req.query;
    const query = { employee: req.user.employee };

    // Filter by month/year if provided
    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Attendance.countDocuments(query);

    // Calculate stats
    const stats = {
      total: count,
      present: attendance.filter(a => a.status === 'Có mặt').length,
      late: attendance.filter(a => a.status === 'Đi muộn').length,
      earlyLeave: attendance.filter(a => a.status === 'Về sớm').length,
      absent: attendance.filter(a => a.status === 'Vắng mặt').length
    };

    res.json({
      success: true,
      attendance,
      stats,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// @desc    Employee self check-in (real time)
// @access  Private (all logged-in users with employee linked)
router.post('/self-check-in', protect, async (req, res) => {
  try {
    if (!req.user.employee) {
      return res.status(400).json({ message: 'Tài khoản không liên kết với nhân viên' });
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already checked in today
    const existing = await Attendance.findOne({
      employee: req.user.employee,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existing) {
      return res.status(400).json({
        message: 'Bạn đã check-in hôm nay lúc ' + existing.checkIn
      });
    }

    // Get current time as HH:MM format (Vietnam timezone)
    const checkInTime = getVietnamTimeString();

    // Determine status based on check-in time
    let status = 'Có mặt';
    const [hours, minutes] = checkInTime.split(':').map(Number);
    if (hours > 8 || (hours === 8 && minutes > 30)) {
      status = 'Đi muộn';
    }

    const attendance = await Attendance.create({
      employee: req.user.employee,
      date: today,
      checkIn: checkInTime,
      status: status,
      note: `Self check-in lúc ${checkInTime}`
    });

    res.status(201).json({
      success: true,
      attendance,
      message: `Check-in thành công lúc ${checkInTime}${status === 'Đi muộn' ? ' (Đi muộn)' : ''}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/attendance/self-check-out
// @desc    Employee self check-out (real time)
// @access  Private (all logged-in users with employee linked)
router.post('/self-check-out', protect, async (req, res) => {
  try {
    if (!req.user.employee) {
      return res.status(400).json({ message: 'Tài khoản không liên kết với nhân viên' });
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's attendance
    const attendance = await Attendance.findOne({
      employee: req.user.employee,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!attendance) {
      return res.status(400).json({ message: 'Bạn chưa check-in hôm nay' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: 'Bạn đã check-out lúc ' + attendance.checkOut
      });
    }

    // Get current time as HH:MM format (Vietnam timezone)
    const checkOutTime = getVietnamTimeString();

    // Update check-out
    attendance.checkOut = checkOutTime;

    // Check if left early (before 17:00)
    const [hours] = checkOutTime.split(':').map(Number);
    if (hours < 17) {
      if (attendance.status === 'Có mặt') {
        attendance.status = 'Về sớm';
      }
    }

    attendance.note = (attendance.note || '') + ` | Check-out lúc ${checkOutTime}`;
    await attendance.save();

    res.json({
      success: true,
      attendance,
      message: `Check-out thành công lúc ${checkOutTime}. Làm việc ${attendance.workHours} giờ.`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================================
// ADMIN/HR/MANAGER ROUTES (with :id param)
// =============================================

// @route   GET /api/attendance/:id
// @desc    Get attendance record by ID
// @access  Private/Admin/HR/Manager
router.get('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('employee', 'fullName employeeId')
      .populate('approvedBy', 'fullName');

    if (!attendance) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi chấm công' });
    }

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/attendance
// @desc    Create attendance record
// @access  Private/Admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/attendance/check-in
// @desc    Check in (admin creates for employee)
// @access  Private/Admin only
router.post('/check-in', protect, authorize('admin'), async (req, res) => {
  try {
    const { employee } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in
    const existing = await Attendance.findOne({
      employee,
      date: { $gte: today }
    });

    if (existing) {
      return res.status(400).json({ message: 'Đã điểm danh hôm nay' });
    }

    const attendance = await Attendance.create({
      employee,
      date: new Date(),
      checkIn: new Date(),
      status: 'Có mặt'
    });

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/attendance/check-out/:id
// @desc    Check out
// @access  Private/Admin only
router.put('/check-out/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Đã điểm danh ra' });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance
// @access  Private/Admin/HR
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi' });
    }

    // Update fields
    Object.assign(attendance, req.body);
    attendance.approvedBy = req.user.id;

    // Save to trigger pre-save hook (recalculates workHours)
    await attendance.save();

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi' });
    }

    res.json({ success: true, message: 'Đã xóa bản ghi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
