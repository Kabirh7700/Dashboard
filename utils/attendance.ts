
import { RawWeeklyAttendance, AttendanceStats, Doer } from '../types.ts';
import { findBestDoerMatch } from './fuzzyMatch.ts';

export const calculateAttendanceStats = (
    weeklyAttendance: RawWeeklyAttendance[],
    userEmail: string,
    allDoers: Doer[]
): AttendanceStats | null => {
    if (!userEmail || !allDoers.length || !weeklyAttendance.length) return null;

    const currentUser = allDoers.find(d => d.email.toLowerCase() === userEmail.toLowerCase());
    if (!currentUser) return null;

    // Find the attendance record that matches the current user by name
    const userRecord = weeklyAttendance.find(rec => {
        const matchedDoer = findBestDoerMatch(rec.doerName, allDoers);
        return matchedDoer?.email.toLowerCase() === currentUser.email.toLowerCase();
    });

    const presentDays = userRecord?.presentDays ?? 0;
    const totalWorkingDays = 5; // As per user request, can be updated later for holidays

    const attendancePercentage = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;
    
    return {
        totalWorkingDays,
        presentDays: parseFloat(presentDays.toFixed(1)),
        attendancePercentage,
    };
};
