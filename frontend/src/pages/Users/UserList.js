import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { KeyIcon, TrashIcon, LockOpenIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/auth/users');
            setUsers(response.data.users);
        } catch (error) {
            toast.error('Không thể tải danh sách tài khoản');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            await api.put(`/auth/users/${selectedUser._id}/reset-password`, { newPassword });
            toast.success(`Đã đổi mật khẩu cho ${selectedUser.username}`);
            setShowPasswordModal(false);
            setNewPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
        }
    };

    const handleToggleActive = async (user) => {
        try {
            await api.put(`/auth/users/${user._id}`, { isActive: !user.isActive });
            toast.success(`${user.isActive ? 'Khóa' : 'Mở khóa'} tài khoản thành công`);
            fetchUsers();
        } catch (error) {
            toast.error('Cập nhật thất bại');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/auth/users/${selectedUser._id}`);
            toast.success('Xóa tài khoản thành công');
            setShowDeleteModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xóa tài khoản thất bại');
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            'admin': 'bg-red-100 text-red-800',
            'hr': 'bg-purple-100 text-purple-800',
            'manager': 'bg-blue-100 text-blue-800',
            'employee': 'bg-green-100 text-green-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const getRoleLabel = (role) => {
        const labels = {
            'admin': 'Admin',
            'hr': 'Nhân sự',
            'manager': 'Trưởng phòng',
            'employee': 'Nhân viên',
        };
        return labels[role] || role;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài khoản</h1>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.fullName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.employee ? `${user.employee.employeeId} - ${user.employee.fullName}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }}
                                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                            title="Đổi mật khẩu"
                                        >
                                            <KeyIcon className="h-4 w-4 mr-1" />
                                            Đổi MK
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(user)}
                                            className={`${user.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'} inline-flex items-center`}
                                            title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                                        >
                                            {user.isActive ? (
                                                <><LockClosedIcon className="h-4 w-4 mr-1" />Khóa</>
                                            ) : (
                                                <><LockOpenIcon className="h-4 w-4 mr-1" />Mở</>
                                            )}
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                                                className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                title="Xóa tài khoản"
                                            >
                                                <TrashIcon className="h-4 w-4 mr-1" />
                                                Xóa
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Reset Password Modal */}
            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Đổi mật khẩu cho: {selectedUser.username}
                        </h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => { setShowPasswordModal(false); setNewPassword(''); }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleResetPassword}
                                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa tài khoản</h3>
                        <p className="text-gray-500 mb-6">
                            Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUser.username}</strong>?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
