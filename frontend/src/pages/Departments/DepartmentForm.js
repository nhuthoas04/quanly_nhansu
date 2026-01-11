import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const DepartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
    if (isEdit) fetchDepartment();
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.employees);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDepartment = async () => {
    try {
      const response = await api.get(`/departments/${id}`);
      const dept = response.data.department;
      reset({
        ...dept,
        manager: dept.manager?._id
      });
    } catch (error) {
      toast.error('Không thể tải thông tin phòng ban');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/departments/${id}`, data);
        toast.success('Cập nhật phòng ban thành công');
      } else {
        await api.post('/departments', data);
        toast.success('Thêm phòng ban thành công');
      }
      navigate('/departments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/departments" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Chỉnh sửa Phòng ban' : 'Thêm Phòng ban mới'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã phòng ban *</label>
            <input type="text" {...register('code', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.code && <span className="text-red-500 text-sm">Vui lòng nhập mã phòng ban</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tên phòng ban *</label>
            <input type="text" {...register('name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.name && <span className="text-red-500 text-sm">Vui lòng nhập tên phòng ban</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trưởng phòng</label>
            <select {...register('manager')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="">Chọn trưởng phòng</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select {...register('isActive')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea {...register('description')} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link to="/departments" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Hủy
          </Link>
          <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
