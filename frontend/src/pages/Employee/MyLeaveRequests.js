import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const MyLeaveRequests = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fetchMyLeaves = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/leaves/my-requests');
            setLeaves(response.data.leaves);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể tải danh sách đơn nghỉ phép');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyLeaves();
    }, [fetchMyLeaves]);

    const handleDelete = async () => {
        try {
            await api.delete(`/leaves/my-request/${deleteId}`);
            toast.success('Đã xóa đơn xin nghỉ phép');
            setShowDeleteModal(false);
            fetchMyLeaves();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể xóa đơn');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Chờ duyệt': 'bg-yellow-100 text-yellow-800',
            'Đã duyệt': 'bg-green-100 text-green-800',
            'Từ chối': 'bg-red-100 text-red-800',
            'Đã hủy': 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Đơn xin nghỉ phép của tôi</h1>
                <Link
                    to="/my-leaves/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Tạo đơn mới
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : leaves.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Bạn chưa có đơn xin nghỉ phép nào</p>
                        <Link
                            to="/my-leaves/new"
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Tạo đơn đầu tiên
                        </Link>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại nghỉ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Từ ngày</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đến ngày</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số ngày</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaves.map((leave) => (
                                <tr key={leave._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leave.leaveType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(leave.startDate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(leave.endDate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.totalDays} ngày</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={leave.reason}>
                                        {leave.reason?.substring(0, 30)}{leave.reason?.length > 30 ? '...' : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                        {leave.status === 'Từ chối' && leave.rejectReason && (
                                            <p className="text-xs text-red-500 mt-1" title={leave.rejectReason}>
                                                Lý do: {leave.rejectReason.substring(0, 20)}...
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {leave.status === 'Chờ duyệt' && (
                                            <>
                                                <Link
                                                    to={`/my-leaves/${leave._id}/edit`}
                                                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                                                >
                                                    <PencilIcon className="h-4 w-4 mr-1" />
                                                    Sửa
                                                </Link>
                                                <button
                                                    onClick={() => { setDeleteId(leave._id); setShowDeleteModal(true); }}
                                                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-1" />
                                                    Xóa
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa đơn</h3>
                        <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa đơn xin nghỉ phép này không?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Không
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                                Xóa đơn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLeaveRequests;
