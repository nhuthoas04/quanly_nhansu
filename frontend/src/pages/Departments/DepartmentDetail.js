import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const DepartmentDetail = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentDetail();
  }, [id]);

  const fetchDepartmentDetail = async () => {
    try {
      const response = await api.get(`/departments/${id}`);
      setDepartment(response.data.department);
      setEmployees(response.data.employees || []);
    } catch (error) {
      toast.error('Không thể tải thông tin phòng ban');
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

  if (!department) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy phòng ban</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/departments" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Chi tiết Phòng ban</h1>
      </div>

      {/* Department Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-500">Mã phòng ban</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{department.code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Tên phòng ban</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{department.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Trưởng phòng</label>
            <p className="mt-1 text-lg text-gray-900">{department.manager?.fullName || 'Chưa có'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Số nhân viên</label>
            <p className="mt-1 text-lg text-gray-900">{employees.length}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500">Mô tả</label>
            <p className="mt-1 text-gray-900">{department.description || 'Không có'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Trạng thái</label>
            <span className={`mt-1 inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${department.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {department.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </span>
          </div>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách nhân viên ({employees.length})</h2>
        </div>
        {employees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có nhân viên nào trong phòng ban này</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện thoại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chức vụ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.position?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.status === 'Đang làm việc' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/employees/${emp._id}`} className="text-indigo-600 hover:text-indigo-900">Chi tiết</Link>
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

export default DepartmentDetail;
