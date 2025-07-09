
import React from 'react';
import { AttendanceStats } from '../types.ts';
import { CalendarDaysIcon } from './Icons.tsx';
import { formatDateShort } from '../utils/date.ts';

interface AttendanceReportProps {
    stats: AttendanceStats | null;
    title?: string;
}

const CircularProgress: React.FC<{ percentage: number }> = ({ percentage }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    let colorClass = 'text-red-500';
    if (percentage >= 90) {
        colorClass = 'text-green-500';
    } else if (percentage >= 75) {
        colorClass = 'text-yellow-500';
    }

    return (
        <div className="relative h-32 w-32">
            <svg className="h-full w-full" viewBox="0 0 120 120">
                <circle
                    className="text-slate-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`transform -rotate-90 origin-center transition-all duration-500 ${colorClass}`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center font-bold ${colorClass}`}>
                <span className="text-3xl">{percentage}</span>
                <span className="text-lg">%</span>
            </div>
        </div>
    );
};

export const AttendanceReport: React.FC<AttendanceReportProps> = ({ stats, title = "Attendance Summary" }) => {
    if (!stats) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-6 space-y-4">
             <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <CalendarDaysIcon className="h-6 w-6 text-slate-500" />
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                </div>
                {stats.startDate && stats.endDate && (
                    <p className="text-sm font-semibold text-slate-500 whitespace-nowrap">
                        ({formatDateShort(stats.startDate)} - {formatDateShort(stats.endDate)})
                    </p>
                )}
            </header>
            <div className="flex items-center justify-around gap-6 text-center">
                <CircularProgress percentage={stats.attendancePercentage} />
                <div className="space-y-3">
                     <div>
                        <p className="text-sm text-slate-500 font-medium">Working Days</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.totalWorkingDays}</p>
                    </div>
                     <div>
                        <p className="text-sm text-slate-500 font-medium">Days Present</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.presentDays}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};