import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { calculateFullSalary, shouldPayTax } from '../../utils/calcSalary';

const SalaryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isViewOnly = id && !window.location.pathname.includes('/edit');
  const isEdit = id && window.location.pathname.includes('/edit');
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    defaultValues: {
      baseSalary: 0,
      pcAnTrua: 0,
      pcDiLai: 0,
      pcDienThoai: 0,
      bonus: 0,
      tax: 0,
      workingDays: 22
    }
  });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  // Watch các trường để tự động tính toán
  const baseSalary = watch('baseSalary');
  const pcAnTrua = watch('pcAnTrua');
  const pcDiLai = watch('pcDiLai');
  const pcDienThoai = watch('pcDienThoai');
  const bonus = watch('bonus');
  const tax = watch('tax');
  
  // Tính toán các giá trị
  const calculations = calculateFullSalary({
    baseSalary,
    pcAnTrua,
    pcDiLai,
    pcDienThoai,
    bonus,
    tax
  });

  useEffect(() => {
    fetchEmployees();
    if (id) {
      fetchSalary();
    }
  }, [id]);

  const fetchSalary = async () => {
    try {
      const response = await api.get(`/salaries/${id}`);
      const salary = response.data.salary;
      reset({
        employee: salary.employee._id,
        month: salary.month,
        year: salary.year,
        baseSalary: salary.baseSalary,
        pcAnTrua: salary.allowances?.food || 0,
        pcDiLai: salary.allowances?.transport || 0,
        pcDienThoai: salary.allowances?.phone || 0,
        bonus: salary.bonus || 0,
        tax: salary.deductions?.tax || 0,
        workingDays: salary.workingDays || 22
      });
    } catch (error) {
      toast.error('Không thể tải thông tin bảng lương');
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
    // Validate: Kiểm tra bảng lương đã tồn tại chưa (chỉ khi tạo mới)
    if (!isEdit) {
      try {
        const checkResponse = await api.get(`/salaries/check-exist`, {
          params: {
            employee: data.employee,
            month: data.month,
            year: data.year
          }
        });
        
        if (checkResponse.data.exists) {
          toast.error('Bảng lương cho nhân viên này trong tháng/năm đã tồn tại!');
          return;
        }
      } catch (error) {
        // Nếu route chưa có thì bỏ qua validation này
        console.log('Check exist API not available');
      }
    }
    
    setLoading(true);
    try {
      // Chuẩn bị payload gửi lên API
      const payload = {
        employee: data.employee,
        month: parseInt(data.month),
        year: parseInt(data.year),
        baseSalary: parseFloat(data.baseSalary),
        allowances: {
          food: parseFloat(data.pcAnTrua) || 0,
          transport: parseFloat(data.pcDiLai) || 0,
          phone: parseFloat(data.pcDienThoai) || 0
        },
        bonus: parseFloat(data.bonus) || 0,
        deductions: {
          socialInsurance: calculations.bhxh,
          healthInsurance: calculations.bhyt,
          tax: calculations.tax
        },
        totalAllowance: (parseFloat(data.pcAnTrua) || 0) + (parseFloat(data.pcDiLai) || 0) + (parseFloat(data.pcDienThoai) || 0),
        totalDeduction: calculations.totalDeduction,
        netSalary: calculations.netSalary,
        workingDays: parseFloat(data.workingDays) || 22,
        actualWorkingDays: parseFloat(data.workingDays) || 22
      };
      
      if (isEdit) {
        await api.put(`/salaries/${id}`, payload);
        toast.success('Cập nhật bảng lương thành công');
      } else {
        await api.post('/salaries', payload);
        toast.success('Tạo bảng lương thành công');
      }
      navigate('/salaries');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/salaries" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isViewOnly ? 'Xem Bảng lương' : isEdit ? 'Chỉnh sửa Bảng lương' : 'Tạo Bảng lương'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Phần 1: Thông tin cơ bản */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
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
              <label className="block text-sm font-medium text-gray-700">Tháng *</label>
              <input 
                type="number" 
                min="1" 
                max="12" 
                {...register('month', { required: !isViewOnly, min: 1, max: 12 })} 
                disabled={isViewOnly}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100" 
              />
              {errors.month && <span className="text-red-500 text-sm">Vui lòng nhập tháng (1-12)</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Năm *</label>
              <input 
                type="number" 
                min="2020"
                {...register('year', { required: !isViewOnly })} 
                disabled={isViewOnly}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100" 
              />
              {errors.year && <span className="text-red-500 text-sm">Vui lòng nhập năm</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Số ngày công *</label>
              <input 
                type="number" 
                min="0" 
                max="31"
                {...register('workingDays', { required: !isViewOnly })} 
                disabled={isViewOnly}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100" 
              />
              {errors.workingDays && <span className="text-red-500 text-sm">Vui lòng nhập số ngày công</span>}
            </div>
          </div>
        </div>

        {/* Phần 2: Thu nhập */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thu nhập</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Lương cơ bản *</label>
              <input 
                type="number" 
                min="0"
                {...register('baseSalary', { required: !isViewOnly, min: 0 })} 
                disabled={isViewOnly}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100" 
              />
              {errors.baseSalary && <span className="text-red-500 text-sm">Vui lòng nhập lương cơ bản</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">PC Ăn trưa</label>
              <input 
                type="number" 
                min="0"
                {...register('pcAnTrua')} 
                disabled={isViewOnly}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">PC Đi lại</label>
              <input 
                type="number" 
                min="0"
                {...register('pcDiLai')} 
                disabled={isViewOnly}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">PC Điện thoại</label>
              <input 
                type="number" 
                min="0"
                {...register('pcDienThoai')} 
                disabled={isViewOnly}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Thưởng</label>
              <input 
                type="number" 
                min="0"
                {...register('bonus')} 
                disabled={isViewOnly}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100" 
              />
            </div>

            <div className="bg-green-50 p-4 rounded-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổng thu nhập</label>
              <div className="text-2xl font-bold text-green-600">
                {calculations.totalIncome.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>
        </div>

        {/* Phần 3: Khấu trừ */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Các khoản khấu trừ</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">BHXH (8%)</label>
              <input 
                type="text" 
                value={calculations.bhxh.toLocaleString('vi-VN')}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 shadow-sm cursor-not-allowed" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">BHYT (1.5%)</label>
              <input 
                type="text" 
                value={calculations.bhyt.toLocaleString('vi-VN')}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 shadow-sm cursor-not-allowed" 
              />
            </div>

            <div className="md:col-span-2">
              <div className="bg-blue-50 p-4 rounded-md mb-3">
                <div className="text-sm text-gray-700">
                  <strong>Thu nhập chịu thuế:</strong> {calculations.taxableIncome.toLocaleString('vi-VN')} đ
                </div>
                {!calculations.mustPayTax && (
                  <div className="text-sm text-green-600 mt-1">
                    ✓ Thu nhập dưới 11.000.000 đ - Không phải đóng thuế TNCN
                  </div>
                )}
                {calculations.mustPayTax && (
                  <div className="text-sm text-orange-600 mt-1">
                    ⚠ Thu nhập từ 11.000.000 đ trở lên - Phải đóng thuế TNCN
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thuế TNCN {calculations.mustPayTax && '(Nhập thủ công)'}
              </label>
              <input 
                type="number" 
                min="0"
                {...register('tax')} 
                disabled={!calculations.mustPayTax || isViewOnly}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                  !calculations.mustPayTax || isViewOnly ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
                }`}
              />
              {!calculations.mustPayTax && (
                <span className="text-xs text-gray-500">Tự động = 0 (do thu nhập thấp)</span>
              )}
            </div>

            <div className="bg-red-50 p-4 rounded-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổng khấu trừ</label>
              <div className="text-2xl font-bold text-red-600">
                {calculations.totalDeduction.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>
        </div>

        {/* Phần 4: Lương thực nhận */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lương thực nhận</label>
            <div className="text-4xl font-bold text-indigo-600">
              {calculations.netSalary.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-sm text-gray-600 mt-2">
              = Tổng thu nhập - Tổng khấu trừ
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Link to="/salaries" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            {isViewOnly ? 'Quay lại' : 'Hủy'}
          </Link>
          {!isViewOnly && (
            <button 
              type="submit" 
              disabled={loading} 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo bảng lương'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SalaryForm;
