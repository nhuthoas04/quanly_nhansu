import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ContractForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isViewOnly = id && !window.location.pathname.includes('/edit');
  const isEdit = id && window.location.pathname.includes('/edit');
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
    if (id) {
      fetchContract();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.employees);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchContract = async () => {
    try {
      const response = await api.get(`/contracts/${id}`);
      const contract = response.data.contract;
      reset({
        ...contract,
        employee: contract.employee._id,
        startDate: contract.startDate?.split('T')[0],
        endDate: contract.endDate?.split('T')[0]
      });
    } catch (error) {
      toast.error('Không thể tải thông tin hợp đồng');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/contracts/${id}`, data);
        toast.success('Cập nhật hợp đồng thành công');
      } else {
        await api.post('/contracts', data);
        toast.success('Tạo hợp đồng thành công');
      }
      navigate('/contracts');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/contracts" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isViewOnly ? 'Xem Hợp đồng' : isEdit ? 'Chỉnh sửa Hợp đồng' : 'Tạo Hợp đồng'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nhân viên *</label>
            <select {...register('employee', { required: !isViewOnly })} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="">Chọn nhân viên</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeId})</option>
              ))}
            </select>
            {errors.employee && !isViewOnly && <span className="text-red-500 text-sm">Vui lòng chọn nhân viên</span>}
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Số hợp đồng</label>
              <input type="text" {...register('contractNumber')} disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Loại hợp đồng *</label>
            <select {...register('contractType', { required: !isViewOnly })} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="">Chọn loại hợp đồng</option>
              <option value="Thử việc">Thử việc</option>
              <option value="Có thời hạn">Có thời hạn</option>
              <option value="Không thời hạn">Không thời hạn</option>
              <option value="Thời vụ">Thời vụ</option>
              <option value="Cộng tác viên">Cộng tác viên</option>
            </select>
            {errors.contractType && !isViewOnly && <span className="text-red-500 text-sm">Vui lòng chọn loại hợp đồng</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu *</label>
            <input type="date" {...register('startDate', { required: !isViewOnly })} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.startDate && !isViewOnly && <span className="text-red-500 text-sm">Vui lòng chọn ngày bắt đầu</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
            <input type="date" {...register('endDate')} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mức lương *</label>
            <input type="number" {...register('salary', { required: !isViewOnly })} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="VD: 15000000" />
            {errors.salary && !isViewOnly && <span className="text-red-500 text-sm">Vui lòng nhập mức lương</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select {...register('status')} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="Chờ ký">Chờ ký</option>
              <option value="Hiệu lực">Hiệu lực</option>
              <option value="Hết hạn">Hết hạn</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
            <textarea {...register('note')} disabled={isViewOnly} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="Nhập ghi chú về hợp đồng..."></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link to="/contracts" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            {isViewOnly ? 'Quay lại' : 'Hủy'}
          </Link>
          {!isViewOnly && (
            <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
              {loading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo hợp đồng'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContractForm;
