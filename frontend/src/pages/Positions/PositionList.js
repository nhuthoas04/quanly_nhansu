import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { PlusIcon } from '@heroicons/react/24/outline';

const PositionList = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await api.get('/positions');
      setPositions(response.data.positions);
    } catch (error) {
      toast.error('Không thể tải danh sách chức vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa chức vụ này?')) {
      try {
        await api.delete(`/positions/${id}`);
        toast.success('Xóa chức vụ thành công');
        fetchPositions();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Xóa chức vụ thất bại');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Chức vụ</h1>
        <Link to="/positions/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm chức vụ
        </Link>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã CV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên chức vụ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mức lương</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positions.map((pos) => (
                <tr key={pos._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pos.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pos.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pos.baseSalary ? new Intl.NumberFormat('vi-VN').format(pos.baseSalary) + ' VNĐ' : 'Chưa cập nhật'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link to={`/positions/${pos._id}/edit`} className="text-indigo-600 hover:text-indigo-900">Sửa</Link>
                    <button onClick={() => handleDelete(pos._id)} className="text-red-600 hover:text-red-900">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PositionList;
