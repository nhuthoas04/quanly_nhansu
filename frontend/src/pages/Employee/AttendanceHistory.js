import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { CalendarDaysIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const AttendanceHistory = () => {
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchHistory();
    }, [month, year]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/attendance/my-history?month=${month}&year=${year}`);
            setAttendance(response.data.attendance);
            setStats(response.data.stats || {});
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Có mặt': return 'bg-green-100 text-green-800';
            case 'Đi muộn': return 'bg-yellow-100 text-yellow-800';
            case 'Về sớm': return 'bg-orange-100 text-orange-800';
            case 'Vắng mặt': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Có mặt': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
            case 'Đi muộn': return <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />;
            case 'Về sớm': return <ExclamationCircleIcon className="h-5 w-5 text-orange-600" />;
            case 'Vắng mặt': return <XCircleIcon className="h-5 w-5 text-red-600" />;
            default: return null;
        }
    };

    const months = [
        { value: 1, label: 'Tháng 1' },
        { value: 2, label: 'Tháng 2' },
        { value: 3, label: 'Tháng 3' },
        { value: 4, label: 'Tháng 4' },
        { value: 5, label: 'Tháng 5' },
        { value: 6, label: 'Tháng 6' },
        { value: 7, label: 'Tháng 7' },
        { value: 8, label: 'Tháng 8' },
        { value: 9, label: 'Tháng 9' },
        { value: 10, label: 'Tháng 10' },
        { value: 11, label: 'Tháng 11' },
        { value: 12, label: 'Tháng 12' },
    ];

    const years = [];
    for (let y = new Date().getFullYear(); y >= 2020; y--) {
        years.push(y);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CalendarDaysIcon className="h-7 w-7 text-primary-600" />
                    Lịch sử Chấm công
                </h1>

                {/* Filter */}
                <div className="flex gap-2">
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-4 text-center">
                    <div className="text-3xl font-bold text-gray-700">{stats.total || 0}</div>
                    <div className="text-sm text-gray-500">Tổng ngày</div>
                </div>
                <div className="bg-green-50 rounded-xl shadow p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.present || 0}</div>
                    <div className="text-sm text-green-700">Có mặt</div>
                </div>
                <div className="bg-yellow-50 rounded-xl shadow p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-600">{stats.late || 0}</div>
                    <div className="text-sm text-yellow-700">Đi muộn</div>
                </div>
                <div className="bg-orange-50 rounded-xl shadow p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">{stats.earlyLeave || 0}</div>
                    <div className="text-sm text-orange-700">Về sớm</div>
                </div>
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Đang tải...</p>
                    </div>
                ) : attendance.length === 0 ? (
                    <div className="text-center py-12">
                        <CalendarDaysIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Không có dữ liệu chấm công tháng này</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số giờ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendance.map((record) => (
                                <tr key={record._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(record.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1 text-green-600">
                                            <ClockIcon className="h-4 w-4" />
                                            <span className="font-medium">{record.checkIn || '--:--'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1 text-red-600">
                                            <ClockIcon className="h-4 w-4" />
                                            <span className="font-medium">{record.checkOut || '--:--'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {record.workHours ? `${record.workHours.toFixed(1)} giờ` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                            {getStatusIcon(record.status)}
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AttendanceHistory;
