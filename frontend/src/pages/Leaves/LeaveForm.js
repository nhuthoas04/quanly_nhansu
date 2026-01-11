import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const LeaveForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isViewOnly = !!id;
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
    if (id) {
      fetchLeave();
    }
  }, [id]);

  const fetchLeave = async () => {
    try {
      const response = await api.get(`/leaves/${id}`);
      const leave = response.data.leave;
      reset({
        employee: leave.employee._id,
        leaveType: leave.leaveType,
        startDate: new Date(leave.startDate).toISOString().split('T')[0],
        endDate: new Date(leave.endDate).toISOString().split('T')[0],
        reason: leave.reason
      });
    } catch (error) {
      toast.error('Không thể tải thông tin đơn nghỉ phép');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.employees);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Calculate total days
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      await api.post('/leaves', { ...data, totalDays });
      toast.success('Tạo đơn nghỉ phép thành công');
      navigate('/leaves');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/leaves" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{isViewOnly ? 'Xem đơn Nghỉ phép' : 'Tạo đơn Nghỉ phép'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nhân viên *</label>
            <select {...register('employee', { required: !isViewOnly })} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="">Chọn nhân viên</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeId})</option>
              ))}
            </select>
            {errors.employee && <span className="text-red-500 text-sm">Vui lòng chọn nhân viên</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Loại nghỉ phép *</label>
            <select {...register('leaveType', { required: !isViewOnly })} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="">Chọn loại nghỉ</option>
              <option value="Nghỉ phép năm">Nghỉ phép năm</option>
              <option value="Nghỉ ốm">Nghỉ ốm</option>
              <option value="Nghỉ không lương">Nghỉ không lương</option>
              <option value="Nghỉ cưới">Nghỉ cưới</option>
              <option value="Nghỉ tang">Nghỉ tang</option>
              <option value="Nghỉ thai sản">Nghỉ thai sản</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.leaveType && <span className="text-red-500 text-sm">Vui lòng chọn loại nghỉ</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu *</label>
            <input type="date" {...register('startDate', { required: !isViewOnly })} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100" />
            {errors.startDate && <span className="text-red-500 text-sm">Vui lòng chọn ngày bắt đầu</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày kết thúc *</label>
            <input type="date" {...register('endDate', { required: !isViewOnly })} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100" />
            {errors.endDate && <span className="text-red-500 text-sm">Vui lòng chọn ngày kết thúc</span>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Lý do *</label>
            <textarea {...register('reason', { required: !isViewOnly })} disabled={isViewOnly} rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"></textarea>
            {errors.reason && <span className="text-red-500 text-sm">Vui lòng nhập lý do</span>}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link to="/leaves" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">{isViewOnly ? 'Quay lại' : 'Hủy'}</Link>
          {!isViewOnly && (
            <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
              {loading ? 'Đang xử lý...' : 'Tạo đơn'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LeaveForm;
