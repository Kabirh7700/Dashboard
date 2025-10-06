
import React, { useState, useMemo } from 'react';
import { TaskData, MISStats, Doer, RawWeeklyAttendance, AttendanceStats, HistoricalDataPoint, TeamPerformanceSummary } from '../types.ts';
import { calculateMISStats, getWorkNotDoneTasks, getWorkNotDoneOnTimeTasks, calculateHistoricalPerformance, calculateTeamPerformanceSummary } from '../utils/stats.ts';
import { getMonthDateRange, parseDate, getLastWeekDateRange, getLastToLastWeekDateRange, getYearDateRange } from '../utils/date.ts';
import { MISScoring } from './MISScoring.tsx';
import { TasksBreakdownTable } from './TasksBreakdownTable.tsx';
import { ChartBarIcon } from './Icons.tsx';
import { EmployeeProfileCard } from './EmployeeProfileCard.tsx';
import { AttendanceReport } from './AttendanceReport.tsx';
import { calculateAttendanceStats } from '../utils/attendance.ts';
import { SearchableDropdown } from './SearchableDropdown.tsx';
import { PerformanceTrendChart } from './PerformanceTrendChart.tsx';
import { TeamPerformanceHighlights } from './TeamPerformanceHighlights.tsx';


interface EmployeeMISViewProps {
    allTasks: TaskData[];
    allDoers: Doer[];
    rawWeeklyAttendance: RawWeeklyAttendance[];
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const EmployeeMISView: React.FC<EmployeeMISViewProps> = ({ allTasks, allDoers, rawWeeklyAttendance }) => {
    const [selectedEmail, setSelectedEmail] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('last-week');

    const periodOptions = useMemo(() => {
        const options = [
            { value: 'last-week', label: 'Last Week' },
            { value: 'last-to-last-week', label: 'Last to Last Week' },
        ];
        
        const yearsWithUndefined = allTasks.map(t => parseDate(t.plannedDate)?.getFullYear());
        // FIX: Using a type assertion after filtering out null/undefined values to ensure
        // the TypeScript compiler correctly infers `definedYears` as `number[]`. This
        // prevents a downstream error in the `sort` method where it would attempt
        // arithmetic on non-numeric types.
        const definedYears = yearsWithUndefined.filter(year => year != null) as number[];
        const years = new Set(definedYears);
        if (!years.has(new Date().getFullYear())) {
            years.add(new Date().getFullYear());
        }

        Array.from(years).sort((a,b) => b - a).forEach(year => {
            options.push({ value: `${year}`, label: `Full Year ${year}`});
            for(let month = 11; month >= 0; month--) {
                options.push({ value: `${year}-${month}`, label: `${MONTH_NAMES[month]} ${year}`})
            }
        });
        
        return options;
    }, [allTasks]);

    const teamPerformanceSummary: TeamPerformanceSummary = useMemo(() => {
        return calculateTeamPerformanceSummary(allTasks, allDoers);
    }, [allTasks, allDoers]);

    const { dateRange, titleSuffix, isWeeklyView } = useMemo(() => {
        if (selectedPeriod === 'last-week') {
            return { dateRange: getLastWeekDateRange(), titleSuffix: "for Last Week", isWeeklyView: true };
        }
        if (selectedPeriod === 'last-to-last-week') {
            return { dateRange: getLastToLastWeekDateRange(), titleSuffix: "for Last to Last Week", isWeeklyView: true };
        }
        if (selectedPeriod.includes('-')) {
            const [year, month] = selectedPeriod.split('-').map(Number);
            const range = getMonthDateRange(year, month);
            return { dateRange: range, titleSuffix: `for ${MONTH_NAMES[month]} ${year}`, isWeeklyView: false };
        }
        const year = parseInt(selectedPeriod, 10);
        const range = getYearDateRange(year);
        return { dateRange: range, titleSuffix: `for ${year}`, isWeeklyView: false };

    }, [selectedPeriod]);

    const selectedDoerStats: MISStats | null = useMemo(() => {
        if (!selectedEmail) return null;
        return calculateMISStats(allTasks, selectedEmail, dateRange.startDate, dateRange.endDate);
    }, [allTasks, selectedEmail, dateRange]);
    
    const weeklyAttendanceStats: AttendanceStats | null = useMemo(() => {
        // Only show attendance for weekly views
        if (!selectedEmail || !isWeeklyView) return null;

        const { startDate, endDate } = dateRange;
        const stats = calculateAttendanceStats(rawWeeklyAttendance, selectedEmail, allDoers, startDate, endDate);
        if (!stats) return null;
        
        return { ...stats, startDate, endDate };
    }, [rawWeeklyAttendance, selectedEmail, allDoers, isWeeklyView, dateRange]);

    const historicalPerformanceData: HistoricalDataPoint[] = useMemo(() => {
        if (!selectedEmail) return [];
        return calculateHistoricalPerformance(allTasks, selectedEmail);
    }, [allTasks, selectedEmail]);

    const workNotDone = useMemo(() => {
        if (!selectedEmail) return [];
        return getWorkNotDoneTasks(allTasks, selectedEmail, dateRange.startDate, dateRange.endDate);
    }, [allTasks, selectedEmail, dateRange]);

    const workNotDoneOnTime = useMemo(() => {
        if (!selectedEmail) return [];
        return getWorkNotDoneOnTimeTasks(allTasks, selectedEmail, dateRange.startDate, dateRange.endDate);
    }, [allTasks, selectedEmail, dateRange]);
    
    const selectedDoer = useMemo(() => {
        return allDoers.find(d => d.email === selectedEmail);
    }, [allDoers, selectedEmail]);

    const doerOptions = useMemo(() => allDoers.map(d => ({ value: d.email, label: `${d.name} (${d.email})`})), [allDoers]);

    return (
        <div className="space-y-8">
            
            <TeamPerformanceHighlights summary={teamPerformanceSummary} onSelectEmployee={setSelectedEmail} />

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Employee MIS Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">
                            Select Employee
                        </label>
                        <SearchableDropdown 
                            items={doerOptions}
                            value={selectedEmail}
                            onChange={setSelectedEmail}
                            placeholder="-- Select an Employee --"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">
                            Select Period
                        </label>
                        <SearchableDropdown
                            items={periodOptions}
                            value={selectedPeriod}
                            onChange={setSelectedPeriod}
                            placeholder="-- Select a Period --"
                        />
                    </div>
                </div>
            </div>

            {selectedDoer ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-1 space-y-8">
                            <EmployeeProfileCard doer={selectedDoer} />
                             {weeklyAttendanceStats && (
                                <AttendanceReport stats={weeklyAttendanceStats} title={`Attendance Summary`} />
                           )}
                        </div>
                        <div className="lg:col-span-2 space-y-8">
                           <MISScoring stats={selectedDoerStats} title={`Performance Overview`} />
                           <PerformanceTrendChart data={historicalPerformanceData} />
                        </div>
                    </div>

                    <TasksBreakdownTable title={`Work NOT Done ${titleSuffix}`} tasks={workNotDone} />
                    <TasksBreakdownTable title={`Work NOT Done On Time ${titleSuffix}`} tasks={workNotDoneOnTime} showDelay={true}/>
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-slate-200/50">
                    <div className="flex justify-center items-center mb-4">
                        <div className="p-4 bg-slate-100 rounded-full">
                           <ChartBarIcon className="h-10 w-10 text-slate-500" />
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-slate-700">Select an Employee</h3>
                    <p className="text-slate-500 mt-1">
                        Choose an employee and a date range to view their MIS report.
                    </p>
                </div>
            )}
        </div>
    );
};
