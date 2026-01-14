import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  ClockIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  FingerPrintIcon,
  UserGroupIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

// Full navigation for admin only
const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Nhân viên', href: '/employees', icon: UsersIcon },
  { name: 'Phòng ban', href: '/departments', icon: BuildingOfficeIcon },
  { name: 'Chức vụ', href: '/positions', icon: BriefcaseIcon },
  { name: 'Chấm công', href: '/attendance', icon: ClockIcon },
  { name: 'Nghỉ phép', href: '/leaves', icon: CalendarDaysIcon },
  { name: 'Lương', href: '/salaries', icon: BanknotesIcon },
  { name: 'Hợp đồng', href: '/contracts', icon: DocumentTextIcon },
  { name: 'Tài khoản', href: '/users', icon: UserGroupIcon },
];

// Limited navigation for manager (Trưởng phòng)
const managerNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Nhân viên', href: '/employees', icon: UsersIcon },
  { name: 'Chấm công', href: '/attendance', icon: ClockIcon },
  { name: 'Nghỉ phép', href: '/leaves', icon: CalendarDaysIcon },
  { name: 'Trang cá nhân', href: '/profile', icon: UserCircleIcon },
];

// Navigation for employees
const employeeNavigation = [
  { name: 'Check In/Out', href: '/my-attendance', icon: FingerPrintIcon },
  { name: 'Lịch sử chấm công', href: '/my-history', icon: ClipboardDocumentListIcon },
  { name: 'Đơn xin nghỉ', href: '/my-leaves', icon: CalendarDaysIcon },
  { name: 'Trang cá nhân', href: '/profile', icon: UserCircleIcon },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Get navigation based on user role
  const getNavigation = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavigation;
      case 'manager':
        return managerNavigation;
      default:
        return employeeNavigation;
    }
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
          <div className="flex items-center justify-between h-16 px-4 bg-primary-600">
            <span className="text-xl font-bold text-white">HR Management</span>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 bg-primary-600">
            <span className="text-xl font-bold text-white">HR Management</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex items-center ml-auto space-x-4">
            <span className="text-sm text-gray-700">
              {user?.fullName} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
