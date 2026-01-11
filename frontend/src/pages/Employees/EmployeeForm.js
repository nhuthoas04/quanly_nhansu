import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  const selectedPosition = watch('position');

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
    if (isEdit) {
      fetchEmployee();
    }
  }, [id]);

  // Check if position is executive (no department needed)
  const isExecutivePosition = () => {
    if (!selectedPosition) return false;
    const position = positions.find(p => p._id === selectedPosition);
    if (!position) return false;
    const name = position.name.toLowerCase();
    return name.includes('giám đốc') || name.includes('director') || name.includes('phó giám đốc');
  };

  // Auto-fill salary and clear department for executive when position is selected
  useEffect(() => {
    if (selectedPosition) {
      const position = positions.find(p => p._id === selectedPosition);
      if (position) {
        // Auto-fill salary for new employee
        if (!isEdit && position.baseSalary) {
          setValue('baseSalary', position.baseSalary);
        }
        // Clear department if executive position
        const name = position.name.toLowerCase();
        if (name.includes('giám đốc') || name.includes('director') || name.includes('phó giám đốc')) {
          setValue('department', '');
        }
      }
    }
  }, [selectedPosition, positions, isEdit, setValue]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await api.get('/positions');
      setPositions(response.data.positions);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${id}`);
      const employee = response.data.employee;
      reset({
        ...employee,
        department: employee.department._id,
        position: employee.position._id,
        dateOfBirth: employee.dateOfBirth?.split('T')[0],
        hireDate: employee.hireDate?.split('T')[0]
      });
    } catch (error) {
      toast.error('Không thể tải thông tin nhân viên');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/employees/${id}`, data);
        toast.success('Cập nhật nhân viên thành công');
        navigate('/employees');
      } else {
        const response = await api.post('/employees', data);
        const { employee, userAccount, userError, contract } = response.data;

        // Show detailed info with alert
        let message = `✅ Thêm nhân viên thành công!\n\n`;
        message += `📋 Mã nhân viên: ${employee.employeeId}\n`;
        message += `👤 Họ tên: ${employee.fullName}\n\n`;

        if (userAccount) {
          const usedPassword = data.password || 'nhanvien123';
          message += `🔐 THÔNG TIN TÀI KHOẢN:\n`;
          message += `   • Tên đăng nhập: ${userAccount.username}\n`;
          message += `   • Mật khẩu: ${usedPassword}\n`;
          message += `   • Quyền: ${userAccount.role}\n\n`;
        } else if (userError) {
          message += `⚠️ KHÔNG TẠO ĐƯỢC TÀI KHOẢN:\n`;
          message += `   Lỗi: ${userError}\n\n`;
          message += `   (Có thể email đã tồn tại trong hệ thống)\n\n`;
        }

        if (contract) {
          message += `📝 HỢP ĐỒNG TỰ ĐỘNG TẠO:\n`;
          message += `   • Số HĐ: ${contract.contractNumber}\n`;
          message += `   • Loại: ${contract.contractType}\n`;
          message += `   • Thời hạn: 3 tháng\n`;
        }

        alert(message);
        toast.success('Thêm nhân viên thành công!');
        navigate('/employees');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/employees" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Chỉnh sửa Nhân viên' : 'Thêm Nhân viên mới'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Mã nhân viên</label>
              <input type="text" {...register('employeeId')} disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm" />
            </div>
          )}

          <div className={isEdit ? '' : 'md:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700">Họ và tên *</label>
            <input type="text" {...register('fullName', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.fullName && <span className="text-red-500 text-sm">Vui lòng nhập họ tên</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input type="email" {...register('email', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.email && <span className="text-red-500 text-sm">Vui lòng nhập email</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại *</label>
            <input type="tel" {...register('phone', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.phone && <span className="text-red-500 text-sm">Vui lòng nhập số điện thoại</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày sinh *</label>
            <input type="date" {...register('dateOfBirth', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.dateOfBirth && <span className="text-red-500 text-sm">Vui lòng chọn ngày sinh</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Giới tính *</label>
            <select {...register('gender', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.gender && <span className="text-red-500 text-sm">Vui lòng chọn giới tính</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CMND/CCCD *</label>
            <input type="text" {...register('identityCard', {
              required: 'Vui lòng nhập CMND/CCCD',
              pattern: {
                value: /^[0-9]+$/,
                message: 'CMND/CCCD phải là số'
              }
            })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.identityCard && <span className="text-red-500 text-sm">{errors.identityCard.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Địa chỉ *</label>
            <input type="text" {...register('address', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.address && <span className="text-red-500 text-sm">Vui lòng nhập địa chỉ</span>}
          </div>

          {!isExecutivePosition() && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Phòng ban *</label>
              <select {...register('department', { required: !isExecutivePosition() })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                <option value="">Chọn phòng ban</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
              {errors.department && <span className="text-red-500 text-sm">Vui lòng chọn phòng ban</span>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Chức vụ *</label>
            <select {...register('position', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="">Chọn chức vụ</option>
              {positions.map(pos => (
                <option key={pos._id} value={pos._id}>{pos.name}</option>
              ))}
            </select>
            {errors.position && <span className="text-red-500 text-sm">Vui lòng chọn chức vụ</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày vào làm *</label>
            <input type="date" {...register('hireDate', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {errors.hireDate && <span className="text-red-500 text-sm">Vui lòng chọn ngày vào làm</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trình độ học vấn</label>
            <select {...register('education')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="Trung cấp">Trung cấp</option>
              <option value="Cao đẳng">Cao đẳng</option>
              <option value="Đại học">Đại học</option>
              <option value="Thạc sĩ">Thạc sĩ</option>
              <option value="Tiến sĩ">Tiến sĩ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Lương cơ bản</label>
            <input type="number" {...register('baseSalary')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu tài khoản</label>
              <input
                type="password"
                {...register('password')}
                placeholder="Mặc định: nhanvien123"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">Để trống sẽ sử dụng mật khẩu mặc định. Tài khoản sẽ được tạo tự động với role theo chức vụ.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select {...register('status')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="Đang làm việc">Đang làm việc</option>
              <option value="Đã nghỉ việc">Đã nghỉ việc</option>
              <option value="Tạm nghỉ">Tạm nghỉ</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link to="/employees" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
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

export default EmployeeForm;
