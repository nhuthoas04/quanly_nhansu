import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    IdentificationIcon,
    BuildingOfficeIcon,
    BriefcaseIcon,
    CalendarIcon,
    KeyIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
    const { user: authUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/profile');
            setProfile(response.data.user);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải thông tin cá nhân');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        setChangingPassword(true);
        try {
            await api.put('/auth/update-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Đổi mật khẩu thành công!');
            setShowPasswordForm(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setChangingPassword(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const employee = profile?.employee;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                    {profile?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{profile?.fullName}</h1>
                <p className="text-gray-500">@{profile?.username}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${profile?.role === 'admin' ? 'bg-red-100 text-red-800' :
                        profile?.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                    }`}>
                    {profile?.role === 'admin' ? 'Quản trị viên' :
                        profile?.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
                </span>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserCircleIcon className="h-5 w-5 text-primary-600" />
                    Thông tin Tài khoản
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{profile?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Ngày tạo tài khoản</p>
                            <p className="font-medium text-gray-900">{formatDate(profile?.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Change Password Button */}
                <div className="mt-6">
                    <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <KeyIcon className="h-5 w-5" />
                        Đổi mật khẩu
                    </button>
                </div>

                {/* Password Form */}
                {showPasswordForm && (
                    <form onSubmit={handleChangePassword} className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                                >
                                    {showPasswords.current ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pr-10"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                                >
                                    {showPasswords.new ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                                >
                                    {showPasswords.confirm ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {changingPassword ? 'Đang xử lý...' : 'Lưu mật khẩu'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPasswordForm(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Employee Info */}
            {employee && (
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <IdentificationIcon className="h-5 w-5 text-primary-600" />
                        Thông tin Nhân viên
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <IdentificationIcon className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Mã nhân viên</p>
                                <p className="font-medium text-gray-900">{employee.employeeId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Số điện thoại</p>
                                <p className="font-medium text-gray-900">{employee.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Phòng ban</p>
                                <p className="font-medium text-gray-900">{employee.department?.name || 'Chưa có'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Chức vụ</p>
                                <p className="font-medium text-gray-900">{employee.position?.name || 'Chưa có'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Ngày vào làm</p>
                                <p className="font-medium text-gray-900">{formatDate(employee.hireDate)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <UserCircleIcon className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Trạng thái</p>
                                <p className="font-medium text-gray-900">{employee.status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
