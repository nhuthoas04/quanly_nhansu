import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { PlusIcon } from '@heroicons/react/24/outline';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      toast.error('Không thể tải danh sách phòng ban');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phòng ban này?')) {
      try {
        await api.delete(`/departments/${id}`);
        toast.success('Xóa phòng ban thành công');
        fetchDepartments();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Xóa phòng ban thất bại');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Phòng ban</h1>
        <Link to="/departments/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm phòng ban
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã PB</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên phòng ban</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trưởng phòng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số NV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((dept) => (
                <tr key={dept._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.manager?.fullName || 'Chưa có'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.employeeCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {dept.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link to={`/departments/${dept._id}`} className="text-blue-600 hover:text-blue-900">Xem</Link>
                    <Link to={`/departments/${dept._id}/edit`} className="text-indigo-600 hover:text-indigo-900">Sửa</Link>
                    <button onClick={() => handleDelete(dept._id)} className="text-red-600 hover:text-red-900">Xóa</button>
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

export default DepartmentList;
