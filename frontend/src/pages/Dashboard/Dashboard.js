import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import {
  UsersIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Tổng nhân viên',
      value: stats?.totalEmployees || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      link: '/employees',
    },
    {
      name: 'Phòng ban',
      value: stats?.totalDepartments || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
      link: '/departments',
    },
    {
      name: 'Điểm danh hôm nay',
      value: stats?.todayAttendance || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      link: '/attendance',
    },
    {
      name: 'Đơn chờ duyệt',
      value: stats?.pendingLeaves || 0,
      icon: CalendarDaysIcon,
      color: 'bg-red-500',
      link: '/leaves',
    },
    {
      name: 'NV mới tháng này',
      value: stats?.newEmployees || 0,
      icon: UsersIcon,
      color: 'bg-purple-500',
      link: '/employees',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Tổng quan hệ thống quản lý nhân sự</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, index) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="group relative bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-md rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            {/* Gradient Overlay */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500`}></div>

            <div className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                </div>
                <div className={`flex-shrink-0 rounded-xl p-3 ${stat.color} shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mt-4 flex items-center text-sm">
                <div className={`w-full bg-gray-200 rounded-full h-1.5 overflow-hidden`}>
                  <div
                    className={`h-full ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: `${Math.min(100, ((stat.value || 0) / 10) * 100)}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Stats */}
        <div className="bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-2xl p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 mr-3 shadow-md">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            Top 5 Phòng ban
          </h2>
          <div className="space-y-5">
            {stats?.departmentStats?.map((dept, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    {dept.department?.name}
                  </span>
                  <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {dept.count} NV
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{
                      width: `${(dept.count / stats.totalEmployees) * 100}%`,
                      animationDelay: `${index * 150}ms`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Stats */}
        <div className="bg-gradient-to-br from-white to-pink-50 shadow-lg rounded-2xl p-6 border border-pink-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-2 mr-3 shadow-md">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            Phân bố giới tính
          </h2>
          <div className="space-y-5">
            {stats?.genderStats?.map((gender, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                    {gender._id}
                  </span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${gender._id === 'Nam'
                    ? 'text-blue-600 bg-blue-100'
                    : gender._id === 'Nữ'
                      ? 'text-pink-600 bg-pink-100'
                      : 'text-gray-600 bg-gray-100'
                    }`}>
                    {gender.count} người
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out shadow-sm ${gender._id === 'Nam'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : gender._id === 'Nữ'
                        ? 'bg-gradient-to-r from-pink-500 to-pink-600'
                        : 'bg-gradient-to-r from-gray-500 to-gray-600'
                      }`}
                    style={{
                      width: `${(gender.count / stats.totalEmployees) * 100}%`,
                      animationDelay: `${index * 150}ms`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leaves */}
      <div className="bg-gradient-to-br from-white to-purple-50 shadow-lg rounded-2xl p-6 border border-purple-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2 mr-3 shadow-md">
              <CalendarDaysIcon className="h-6 w-6 text-white" />
            </div>
            Đơn xin nghỉ chờ duyệt
          </div>
          <span className="text-sm font-semibold bg-purple-100 text-purple-600 px-4 py-2 rounded-full">
            {stats?.recentLeaves?.length || 0} đơn
          </span>
        </h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Loại nghỉ
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ngày bắt đầu
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Số ngày
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentLeaves?.length > 0 ? (
                stats.recentLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-purple-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {leave.employee?.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(leave.startDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {leave.totalDays} ngày
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex text-xs font-bold leading-5 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm">
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 rounded-full p-4 mb-3">
                        <CalendarDaysIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">Không có đơn chờ duyệt</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end">
          <Link
            to="/leaves"
            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Xem tất cả
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
