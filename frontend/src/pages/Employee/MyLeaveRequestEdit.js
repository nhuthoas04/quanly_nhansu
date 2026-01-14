import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const MyLeaveRequestEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [formData, setFormData] = useState({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const fetchLeave = useCallback(async () => {
        try {
            setLoadingData(true);
            const response = await api.get('/leaves/my-requests');
            const leave = response.data.leaves.find(l => l._id === id);

            if (!leave) {
                toast.error('Không tìm thấy đơn nghỉ phép');
                navigate('/my-leaves');
                return;
            }

            if (leave.status !== 'Chờ duyệt') {
                toast.error('Chỉ có thể sửa đơn đang chờ duyệt');
                navigate('/my-leaves');
                return;
            }

            setFormData({
                leaveType: leave.leaveType,
                startDate: new Date(leave.startDate).toISOString().split('T')[0],
                endDate: new Date(leave.endDate).toISOString().split('T')[0],
                reason: leave.reason
            });
        } catch (error) {
            toast.error('Không thể tải thông tin đơn nghỉ phép');
            navigate('/my-leaves');
        } finally {
            setLoadingData(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchLeave();
    }, [fetchLeave]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            toast.error('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }

        setLoading(true);
        try {
            await api.put(`/leaves/my-request/${id}`, formData);
            toast.success('Đã cập nhật đơn xin nghỉ phép!');
            navigate('/my-leaves');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // Calculate total days
    const calculateDays = () => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return diff > 0 ? diff : 0;
        }
        return 0;
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-4">
                <Link to="/my-leaves" className="inline-flex items-center text-gray-600 hover:text-gray-900">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Quay lại
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Sửa đơn xin nghỉ phép</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại nghỉ phép *</label>
                    <select
                        name="leaveType"
                        value={formData.leaveType}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                    >
                        <option value="">Chọn loại nghỉ</option>
                        <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                        <option value="Nghỉ ốm">Nghỉ ốm</option>
                        <option value="Nghỉ không lương">Nghỉ không lương</option>
                        <option value="Nghỉ cưới">Nghỉ cưới</option>
                        <option value="Nghỉ tang">Nghỉ tang</option>
                        <option value="Nghỉ thai sản">Nghỉ thai sản</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            required
                        />
                    </div>
                </div>

                {calculateDays() > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 font-medium">
                            Tổng số ngày nghỉ: <span className="text-2xl">{calculateDays()}</span> ngày
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lý do xin nghỉ *</label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows="4"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Nhập lý do xin nghỉ phép..."
                        required
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <Link
                        to="/my-leaves"
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Hủy
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                    >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MyLeaveRequestEdit;
