import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import StatsCard from '../../components/StatsCard';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BuildingOfficeIcon,
  ClockIcon,
  DocumentTextIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    todayAttendance: 0,
    pendingLeaves: 0,
    newEmployeesThisMonth: 0,
    totalSalaryThisMonth: 0,
  });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const employeesRes = await api.get('/employees');
      const employees = employeesRes.data.employees || [];
      
      // Fetch departments
      const departmentsRes = await api.get('/departments');
      const depts = departmentsRes.data.departments || [];
      
      // Fetch leaves
      const leavesRes = await api.get('/leaves');
      const leaves = leavesRes.data.leaves || [];
      const pending = leaves.filter(l => l.status === 'Chờ duyệt');
      
      // Fetch attendance today
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await api.get('/attendance', {
        params: { date: today }
      });
      const todayAttendance = attendanceRes.data.total || 0;

      // Calculate new employees this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newEmployees = employees.filter(emp => {
        const hireDate = new Date(emp.hireDate);
        return hireDate.getMonth() === currentMonth && hireDate.getFullYear() === currentYear;
      });

      // Calculate total salary this month (mock data)
      const totalSalary = employees.length * 15000000; // Average salary

      setStats({
        totalEmployees: employees.length,
        totalDepartments: depts.length,
        todayAttendance,
        pendingLeaves: pending.length,
        newEmployeesThisMonth: newEmployees.length,
        totalSalaryThisMonth: totalSalary,
      });

      setPendingLeaves(pending.slice(0, 5)); // Top 5
      setDepartments(depts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Tổng quan hệ thống quản lý nhân sự</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Tổng nhân viên"
          value={stats.totalEmployees}
          icon={UsersIcon}
          color="blue"
          trend="up"
          trendValue="+5"
        />
        <StatsCard
          title="Phòng ban"
          value={stats.totalDepartments}
          icon={BuildingOfficeIcon}
          color="purple"
        />
        <StatsCard
          title="Điểm danh hôm nay"
          value={stats.todayAttendance}
          icon={ClockIcon}
          color="green"
        />
        <StatsCard
          title="Đơn chờ duyệt"
          value={stats.pendingLeaves}
          icon={DocumentTextIcon}
          color="yellow"
        />
        <StatsCard
          title="NV mới tháng này"
          value={stats.newEmployeesThisMonth}
          icon={UserPlusIcon}
          color="indigo"
          trend="up"
          trendValue="+2"
        />
        <StatsCard
          title="Tổng lương tháng"
          value={formatCurrency(stats.totalSalaryThisMonth)}
          icon={CurrencyDollarIcon}
          color="red"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Leaves */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Đơn xin nghỉ chờ duyệt</h3>
            <Link to="/leaves" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          {pendingLeaves.length > 0 ? (
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div key={leave._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{leave.employee?.fullName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(leave.startDate).toLocaleDateString('vi-VN')} - {new Date(leave.endDate).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{leave.leaveType}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    {leave.totalDays} ngày
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="Không có đơn chờ duyệt"
              description="Tất cả đơn nghỉ phép đã được xử lý"
            />
          )}
        </Card>

        {/* Department Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top phòng ban</h3>
            <Link to="/departments" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Xem chi tiết →
            </Link>
          </div>
          {departments.length > 0 ? (
            <div className="space-y-4">
              {departments.slice(0, 5).map((dept, index) => {
                const employeeCount = dept.employeeCount || 0;
                const percentage = stats.totalEmployees > 0 ? (employeeCount / stats.totalEmployees) * 100 : 0;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500'];
                
                return (
                  <div key={dept._id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{dept.departmentName}</span>
                      <span className="text-sm text-gray-600">{employeeCount} NV</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${colors[index % colors.length]} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState 
              title="Chưa có phòng ban"
              description="Hãy thêm phòng ban đầu tiên"
            />
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/employees/new"
            className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all"
          >
            <UsersIcon className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Thêm nhân viên</span>
          </Link>
          <Link 
            to="/attendance/new"
            className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all"
          >
            <ClockIcon className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Chấm công</span>
          </Link>
          <Link 
            to="/leaves/new"
            className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all"
          >
            <DocumentTextIcon className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Tạo đơn nghỉ</span>
          </Link>
          <Link 
            to="/salaries/new"
            className="flex flex-col items-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg hover:shadow-md transition-all"
          >
            <CurrencyDollarIcon className="h-8 w-8 text-red-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Tạo bảng lương</span>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
