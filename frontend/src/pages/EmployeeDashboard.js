import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { ClockIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [canCheckIn, setCanCheckIn] = useState(false);
    const [canCheckOut, setCanCheckOut] = useState(false);
    const [loading, setLoading] = useState(false);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch today's attendance
    useEffect(() => {
        fetchTodayAttendance();
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            const response = await api.get('/attendance/my-today');
            setTodayAttendance(response.data.attendance);
            setCanCheckIn(response.data.canCheckIn);
            setCanCheckOut(response.data.canCheckOut);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            const response = await api.post('/attendance/self-check-in');
            toast.success(response.data.message);
            fetchTodayAttendance();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            const response = await api.post('/attendance/self-check-out');
            toast.success(response.data.message);
            fetchTodayAttendance();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    Xin chào, {user?.fullName}!
                </h1>
                <p className="text-gray-500 mt-2">{formatDate(currentTime)}</p>
            </div>

            {/* Clock and Check-in/out Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Current Time Display */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8 text-center">
                    <ClockIcon className="h-16 w-16 mx-auto mb-4 opacity-80" />
                    <div className="text-6xl font-mono font-bold tracking-wider">
                        {formatTime(currentTime)}
                    </div>
                    <p className="mt-2 text-primary-200">Giờ hiện tại</p>
                </div>

                {/* Attendance Status */}
                <div className="p-8">
                    {todayAttendance ? (
                        <div className="space-y-6">
                            {/* Status Badge */}
                            <div className="text-center">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${todayAttendance.status === 'Có mặt' ? 'bg-green-100 text-green-800' :
                                    todayAttendance.status === 'Đi muộn' ? 'bg-yellow-100 text-yellow-800' :
                                        todayAttendance.status === 'Về sớm' ? 'bg-orange-100 text-orange-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {todayAttendance.status}
                                </span>
                            </div>

                            {/* Check-in/out Times */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-green-50 rounded-xl p-6 text-center">
                                    <ArrowRightOnRectangleIcon className="h-10 w-10 mx-auto text-green-600 mb-2" />
                                    <p className="text-sm text-gray-500">Check-in</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {todayAttendance.checkIn || '--:--'}
                                    </p>
                                </div>
                                <div className="bg-red-50 rounded-xl p-6 text-center">
                                    <ArrowLeftOnRectangleIcon className="h-10 w-10 mx-auto text-red-600 mb-2" />
                                    <p className="text-sm text-gray-500">Check-out</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {todayAttendance.checkOut || '--:--'}
                                    </p>
                                </div>
                            </div>

                            {/* Work Hours */}
                            {todayAttendance.workHours > 0 && (
                                <div className="text-center bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500">Số giờ làm việc hôm nay</p>
                                    <p className="text-3xl font-bold text-gray-700">
                                        {todayAttendance.workHours.toFixed(2)} giờ
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-lg">Bạn chưa check-in hôm nay</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-center gap-4">
                        {canCheckIn && (
                            <button
                                onClick={handleCheckIn}
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl"
                            >
                                <ArrowRightOnRectangleIcon className="h-6 w-6" />
                                CHECK-IN
                            </button>
                        )}

                        {canCheckOut && (
                            <button
                                onClick={handleCheckOut}
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl"
                            >
                                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                                CHECK-OUT
                            </button>
                        )}

                        {!canCheckIn && !canCheckOut && todayAttendance && (
                            <div className="text-center text-gray-500">
                                <p className="text-lg">✅ Bạn đã hoàn thành chấm công hôm nay!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow p-4 text-center">
                    <p className="text-sm text-gray-500">Giờ vào tiêu chuẩn</p>
                    <p className="text-xl font-bold text-gray-700">08:00</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 text-center">
                    <p className="text-sm text-gray-500">Giờ ra tiêu chuẩn</p>
                    <p className="text-xl font-bold text-gray-700">17:00</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 text-center">
                    <p className="text-sm text-gray-500">Đi muộn sau</p>
                    <p className="text-xl font-bold text-gray-700">08:30</p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
