import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const PositionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) fetchPosition();
  }, [id]);

  const fetchPosition = async () => {
    try {
      const response = await api.get(`/positions/${id}`);
      reset(response.data.position);
    } catch (error) {
      toast.error('Không thể tải thông tin chức vụ');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/positions/${id}`, data);
        toast.success('Cập nhật chức vụ thành công');
      } else {
        await api.post('/positions', data);
        toast.success('Thêm chức vụ thành công');
      }
      navigate('/positions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/positions" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Chỉnh sửa Chức vụ' : 'Thêm Chức vụ mới'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã chức vụ *</label>
            <input type="text" {...register('code', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.code && <span className="text-red-500 text-sm">Vui lòng nhập mã chức vụ</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tên chức vụ *</label>
            <input type="text" {...register('name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.name && <span className="text-red-500 text-sm">Vui lòng nhập tên chức vụ</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Lương cơ bản</label>
            <input type="number" {...register('baseSalary')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="VD: 15000000" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea {...register('description')} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link to="/positions" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Hủy</Link>
          <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PositionForm;
