import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const LeaveList = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'approve' or 'reject'
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves', {
        params: {
          leaveType: filterType,
          status: filterStatus,
          month: filterMonth,
          year: filterYear
        }
      });
      setLeaves(response.data.leaves);
    } catch (error) {
      toast.error('Không thể tải danh sách nghỉ phép');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, filterMonth, filterYear]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleDeleteLeave = async () => {
    try {
      await api.delete(`/leaves/${deleteId}`);
      toast.success('Xóa đơn nghỉ phép thành công');
      setShowDeleteModal(false);
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa đơn nghỉ phép thất bại');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/leaves/${id}/approve`);
      toast.success('Duyệt đơn thành công');
      setShowModal(false);
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Duyệt đơn thất bại');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await api.put(`/leaves/${selectedLeaveId}/reject`, { rejectReason });
      toast.success('Từ chối đơn thành công');
      setShowModal(false);
      setRejectReason('');
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Từ chối đơn thất bại');
    }
  };

  const openModal = (type, leaveId) => {
    setModalType(type);
    setSelectedLeaveId(leaveId);
    setShowModal(true);
  };

  const confirmAction = () => {
    if (modalType === 'approve') {
      handleApprove(selectedLeaveId);
    } else {
      handleReject();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Chờ duyệt': 'bg-yellow-100 text-yellow-800',
      'Đã duyệt': 'bg-green-100 text-green-800',
      'Từ chối': 'bg-red-100 text-red-800',
      'Đã hủy': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Nghỉ phép</h1>
        <Link to="/leaves/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <PlusIcon className="h-5 w-5 mr-2" />
          Tạo đơn nghỉ
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Tất cả loại phép</option>
            <option value="Nghỉ phép năm">Nghỉ phép năm</option>
            <option value="Nghỉ ốm">Nghỉ ốm</option>
            <option value="Nghỉ không lương">Nghỉ không lương</option>
            <option value="Nghỉ cưới">Nghỉ cưới</option>
            <option value="Nghỉ tang">Nghỉ tang</option>
            <option value="Nghỉ thai sản">Nghỉ thai sản</option>
            <option value="Khác">Khác</option>
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
            <option value="Từ chối">Từ chối</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại nghỉ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Từ ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đến ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leave.employee?.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.leaveType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.startDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.endDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.totalDays} ngày</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {leave.status === 'Chờ duyệt' && (
                      <>
                        <button onClick={() => openModal('approve', leave._id)} className="text-green-600 hover:text-green-900">Duyệt</button>
                        <button onClick={() => openModal('reject', leave._id)} className="text-red-600 hover:text-red-900">Từ chối</button>
                      </>
                    )}
                    <Link to={`/leaves/${leave._id}`} className="text-indigo-600 hover:text-indigo-900">Xem</Link>
                    {user?.role === 'admin' && (
                      <button onClick={() => { setDeleteId(leave._id); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-900">Xóa</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal xác nhận */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalType === 'approve' ? 'Xác nhận duyệt đơn' : 'Xác nhận từ chối đơn'}
                    </h3>
                    <div className="mt-2">
                      {modalType === 'approve' ? (
                        <p className="text-sm text-gray-500">Bạn có chắc chắn muốn duyệt đơn nghỉ phép này không?</p>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Lý do từ chối *</label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows="3"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Nhập lý do từ chối..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmAction}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${modalType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    }`}
                >
                  {modalType === 'approve' ? 'Duyệt' : 'Từ chối'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setRejectReason(''); }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa đơn nghỉ phép</h3>
            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa đơn nghỉ phép này không?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteLeave}
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

export default LeaveList;
