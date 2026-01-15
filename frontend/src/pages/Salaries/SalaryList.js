import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { PlusIcon } from '@heroicons/react/24/outline';

const SalaryList = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteSalary = async () => {
    try {
      await api.delete(`/salaries/${deleteId}`);
      toast.success('Xóa bảng lương thành công');
      setShowDeleteModal(false);
      fetchSalaries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa bảng lương thất bại');
    }
  };

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Filters
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchSalaries();
  }, [filterMonth, filterYear, filterStatus]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/salaries', {
        params: {
          month: filterMonth,
          year: filterYear,
          status: filterStatus
        }
      });
      setSalaries(response.data.salaries);
    } catch (error) {
      toast.error('Không thể tải danh sách lương');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (salaryId, newStatus) => {
    setUpdatingStatus(salaryId);
    try {
      await api.patch(`/salaries/${salaryId}/status`, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchSalaries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Chờ duyệt': 'bg-yellow-100 text-yellow-800',
      'Đã duyệt': 'bg-green-100 text-green-800',
      'Đã thanh toán': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Lương</h1>
        <Link to="/salaries/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <PlusIcon className="h-5 w-5 mr-2" />
          Tạo bảng lương
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter by Month */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="1">Tháng 1</option>
            <option value="2">Tháng 2</option>
            <option value="3">Tháng 3</option>
            <option value="4">Tháng 4</option>
            <option value="5">Tháng 5</option>
            <option value="6">Tháng 6</option>
            <option value="7">Tháng 7</option>
            <option value="8">Tháng 8</option>
            <option value="9">Tháng 9</option>
            <option value="10">Tháng 10</option>
            <option value="11">Tháng 11</option>
            <option value="12">Tháng 12</option>
          </select>

          {/* Filter by Year */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tháng/Năm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lương CB</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phụ cấp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khấu trừ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thực nhận</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaries.map((salary) => (
                <tr key={salary._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{salary.employee?.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salary.month}/{salary.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.NumberFormat('vi-VN').format(salary.baseSalary)} đ</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.NumberFormat('vi-VN').format(salary.totalAllowance)} đ</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.NumberFormat('vi-VN').format(salary.totalDeduction)} đ</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{new Intl.NumberFormat('vi-VN').format(salary.netSalary)} đ</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={salary.status}
                      onChange={(e) => handleStatusChange(salary._id, e.target.value)}
                      disabled={updatingStatus === salary._id || salary.status === 'Đã thanh toán'}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-primary-500 ${getStatusColor(salary.status)} ${(updatingStatus === salary._id || salary.status === 'Đã thanh toán') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="Chờ duyệt">Chờ duyệt</option>
                      <option value="Đã duyệt">Đã duyệt</option>
                      <option value="Đã thanh toán">Đã thanh toán</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link to={`/salaries/${salary._id}`} className="text-blue-600 hover:text-blue-900">Xem</Link>
                    {salary.status !== 'Đã thanh toán' && (
                      <>
                        <Link to={`/salaries/${salary._id}/edit`} className="text-indigo-600 hover:text-indigo-900">Sửa</Link>
                        <button onClick={() => { setDeleteId(salary._id); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-900">Xóa</button>
                      </>
                    )}
                    {salary.status === 'Đã thanh toán' && (
                      <span className="text-gray-400 text-xs italic">🔒 Đã khóa</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa bảng lương này? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteSalary}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryList;
