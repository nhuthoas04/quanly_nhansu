import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const AttendanceForm = () => {
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
      fetchAttendance();
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

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/attendance/${id}`);
      const attendance = response.data.attendance;
      reset({
        ...attendance,
        employee: attendance.employee._id,
        date: attendance.date?.split('T')[0]
      });
    } catch (error) {
      toast.error('Không thể tải thông tin chấm công');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/attendance/${id}`, data);
        toast.success('Cập nhật chấm công thành công');
      } else {
        await api.post('/attendance', data);
        toast.success('Thêm chấm công thành công');
      }
      // Force refresh by using replace and adding timestamp
      setTimeout(() => {
        window.location.replace('/attendance?_=' + Date.now());
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/attendance" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isViewOnly ? 'Xem Chấm công' : isEdit ? 'Chỉnh sửa Chấm công' : 'Thêm Chấm công'}
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày *</label>
            <input type="date" {...register('date', { required: !isViewOnly })} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.date && !isViewOnly && <span className="text-red-500 text-sm">Vui lòng chọn ngày</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Giờ vào</label>
            <input
              type="time"
              {...register('checkIn')}
              disabled={isViewOnly}
              step="60"
              placeholder="HH:MM"
              pattern="[0-9]{2}:[0-9]{2}"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {!isViewOnly && <p className="mt-1 text-xs text-gray-500">Định dạng 24h (VD: 08:00, 15:30)</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Giờ ra</label>
            <input
              type="time"
              {...register('checkOut')}
              disabled={isViewOnly}
              step="60"
              placeholder="HH:MM"
              pattern="[0-9]{2}:[0-9]{2}"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {!isViewOnly && <p className="mt-1 text-xs text-gray-500">Định dạng 24h (VD: 17:00, 23:30)</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái *</label>
            <select {...register('status', { required: !isViewOnly })} disabled={isViewOnly} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="Có mặt">Có mặt</option>
              <option value="Vắng mặt">Vắng mặt</option>
              <option value="Đi muộn">Đi muộn</option>
              <option value="Về sớm">Về sớm</option>
              <option value="Nghỉ phép">Nghỉ phép</option>
              <option value="Công tác">Công tác</option>
              <option value="Làm việc từ xa">Làm việc từ xa</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
            <textarea {...register('note')} disabled={isViewOnly} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link to="/attendance" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            {isViewOnly ? 'Quay lại' : 'Hủy'}
          </Link>
          {!isViewOnly && (
            <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
              {loading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AttendanceForm;
