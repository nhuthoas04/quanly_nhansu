const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Salary = require('../models/Salary');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/Admin/HR/Manager
router.get('/stats', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    // Total employees
    const totalEmployees = await Employee.countDocuments({ status: 'Đang làm việc' });
    
    // Total departments
    const totalDepartments = await Department.countDocuments({ isActive: true });
    
    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today },
      status: 'Có mặt'
    });
    
    // Pending leaves
    const pendingLeaves = await Leave.countDocuments({ status: 'Chờ duyệt' });
    
    // This month's stats
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const monthlySalary = await Salary.aggregate([
      { 
        $match: { 
          month: currentMonth, 
          year: currentYear 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$netSalary' } 
        } 
      }
    ]);

    // New employees this month
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const newEmployees = await Employee.countDocuments({
      hireDate: { $gte: firstDayOfMonth }
    });

    // Department with most employees
    const departmentStats = await Employee.aggregate([
      { $match: { status: 'Đang làm việc' } },
      { 
        $group: { 
          _id: '$department', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: '$department' }
    ]);

    // Gender distribution
    const genderStats = await Employee.aggregate([
      { $match: { status: 'Đang làm việc' } },
      { 
        $group: { 
          _id: '$gender', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Recent leaves
    const recentLeaves = await Leave.find({ status: 'Chờ duyệt' })
      .populate('employee', 'fullName employeeId')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalEmployees,
        totalDepartments,
        todayAttendance,
        pendingLeaves,
        newEmployees,
        monthlySalary: monthlySalary[0]?.total || 0,
        departmentStats,
        genderStats,
        recentLeaves
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/dashboard/attendance-overview
// @desc    Get attendance overview for current month
// @access  Private/Admin/HR/Manager
router.get('/attendance-overview', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);

    const attendanceData = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ success: true, attendanceData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
