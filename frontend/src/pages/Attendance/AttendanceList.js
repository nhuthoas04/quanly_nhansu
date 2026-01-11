import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { PlusIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../../context/AuthContext';

const AttendanceList = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async () => {
    try {
      await api.delete(`/attendance/${deleteId}`);
      toast.success('Xóa chấm công thành công');
      setShowDeleteModal(false);
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa chấm công thất bại');
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
    fetchAttendance();
  }, [filterMonth, filterYear, filterStatus]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance', {
        params: {
          month: filterMonth,
          year: filterYear,
          status: filterStatus
        }
      });
      setAttendance(response.data.attendance);
    } catch (error) {
      toast.error('Không thể tải danh sách chấm công');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Có mặt': 'bg-green-100 text-green-800',
      'Vắng mặt': 'bg-red-100 text-red-800',
      'Đi muộn': 'bg-yellow-100 text-yellow-800',
      'Về sớm': 'bg-orange-100 text-orange-800',
      'Nghỉ phép': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Chấm công</h1>
        {isAdmin && (
          <Link to="/attendance/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm chấm công
          </Link>
        )}
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
            <option value="Có mặt">Có mặt</option>
            <option value="Vắng mặt">Vắng mặt</option>
            <option value="Đi muộn">Đi muộn</option>
            <option value="Về sớm">Về sớm</option>
            <option value="Nghỉ phép">Nghỉ phép</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giờ vào</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giờ ra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số giờ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.employee?.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.checkIn || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.checkOut || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.workHours || 0}h</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link to={`/attendance/${item._id}`} className="text-blue-600 hover:text-blue-900">Xem</Link>
                    {isAdmin && (
                      <>
                        <Link to={`/attendance/${item._id}/edit`} className="text-indigo-600 hover:text-indigo-900">Sửa</Link>
                        <button onClick={() => { setDeleteId(item._id); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-900">Xóa</button>
                      </>
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
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa chấm công</h3>
            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa bản ghi chấm công này không?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
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

export default AttendanceList;
