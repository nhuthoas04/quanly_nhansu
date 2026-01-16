import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { PlusIcon } from '@heroicons/react/24/outline';

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/contracts/${deleteId}`);
      toast.success('Xóa hợp đồng thành công');
      setShowDeleteModal(false);
      fetchContracts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa hợp đồng thất bại');
    }
  };

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchContracts();
  }, [filterType, filterStatus]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contracts', {
        params: {
          contractType: filterType,
          status: filterStatus
        }
      });
      setContracts(response.data.contracts);
    } catch (error) {
      toast.error('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/contracts/${id}/status`, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchContracts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại');
      fetchContracts(); // Refresh to revert UI
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Hiệu lực': 'bg-green-100 text-green-800',
      'Hết hạn': 'bg-red-100 text-red-800',
      'Đã hủy': 'bg-gray-100 text-gray-800',
      'Chờ ký': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isContractLocked = (contract) => {
    return contract.status === 'Hiệu lực' || contract.status === 'Hết hạn' || contract.status === 'Đã hủy';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Hợp đồng</h1>
        <Link to="/contracts/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <PlusIcon className="h-5 w-5 mr-2" />
          Tạo hợp đồng
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Tất cả loại hợp đồng</option>
            <option value="Thử việc">Thử việc</option>
            <option value="Có thời hạn">Có thời hạn</option>
            <option value="Không thời hạn">Không thời hạn</option>
            <option value="Thời vụ">Thời vụ</option>
            <option value="Hợp tác">Hợp tác</option>
          </select>

          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ ký">Chờ ký</option>
            <option value="Hiệu lực">Hiệu lực</option>
            <option value="Hết hạn">Hết hạn</option>
            <option value="Đã hủy">Đã hủy</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số HĐ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại HĐ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày bắt đầu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày kết thúc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mức lương</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr key={contract._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contract.contractNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.employee?.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.contractType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(contract.startDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : 'Không thời hạn'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.NumberFormat('vi-VN').format(contract.salary)} đ</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link to={`/contracts/${contract._id}`} className="text-blue-600 hover:text-blue-900">Xem</Link>

                    {/* Disable edit button for locked contracts */}
                    {isContractLocked(contract) ? (
                      <span className="text-gray-400 cursor-not-allowed" title="Không thể sửa hợp đồng đã khóa">
                        Sửa
                      </span>
                    ) : (
                      <Link to={`/contracts/${contract._id}/edit`} className="text-indigo-600 hover:text-indigo-900">Sửa</Link>
                    )}

                    <button
                      onClick={() => handleDeleteClick(contract._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>

                    {/* Disable status dropdown for locked contracts */}
                    <select
                      value={contract.status}
                      onChange={(e) => handleStatusChange(contract._id, e.target.value)}
                      disabled={isContractLocked(contract)}
                      className={`inline-flex text-xs px-2 py-1 border rounded ${isContractLocked(contract)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'border-gray-300'
                        }`}
                      title={isContractLocked(contract) ? 'Không thể thay đổi trạng thái hợp đồng đã khóa' : ''}
                    >
                      <option value="Chờ ký">Chờ ký</option>
                      <option value="Hiệu lực">Hiệu lực</option>
                      <option value="Hết hạn">Hết hạn</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa hợp đồng</h3>
            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa hợp đồng này không? Hành động này không thể hoàn tác.</p>
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

export default ContractList;
