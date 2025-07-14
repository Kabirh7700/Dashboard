import { TaskData, MISStats, HistoricalDataPoint, TeamPerformanceSummary, Doer } from '../types.ts';
import { parseDate, getMonthDateRange, getLastWeekDateRange } from './date.ts';

const roundToTwoDecimals = (num: number): number => {
    if (num === 0) return 0;
    // Round to 2 decimal places
    return Math.round((num + Number.EPSILON) * 100) / 100;
};


export const calculateMISStats = (tasks: TaskData[], userEmail: string | null, startDate: Date, endDate: Date): MISStats | null => {
    if (!userEmail) return null;

    const userTasks = tasks.filter(task => task.emailId === userEmail);

    const tasksPlannedInPeriod = userTasks.filter(task => {
        const plannedDate = parseDate(task.plannedDate);
        return plannedDate && plannedDate >= startDate && plannedDate <= endDate;
    });

    const periodPlannedCount = tasksPlannedInPeriod.length;
    
    const completedTasks = tasksPlannedInPeriod.filter(task => task.actualDate);
    const completedTasksCount = completedTasks.length;
    
    const onTimeTasksCount = completedTasks.filter(task => {
        if (!task.actualDate) return false;
        const actualDate = parseDate(task.actualDate);
        const plannedDate = parseDate(task.plannedDate);
        return actualDate && plannedDate && actualDate.getTime() <= plannedDate.getTime();
    }).length;

    // Based on user formula: =iferror(if(F7<>"",round(F7/E7*100-100,2),""),0)
    // Where F7 is "Actual" and E7 is "Planned"
    // This calculates percentage difference. Negative means less than planned.

    // KPI 1: % work NOT done. Performance is diff between completed and planned.
    const planVsActualPerformance = periodPlannedCount > 0
        ? (completedTasksCount / periodPlannedCount * 100) - 100
        : 0;

    // KPI 2: % work NOT done on time. Base is completed tasks.
    const onTimeBase = completedTasksCount;
    const onTimePerformance = onTimeBase > 0
        ? (onTimeTasksCount / onTimeBase * 100) - 100
        : 0;

    return {
        planVsActual: {
            base: periodPlannedCount,
            // The 'met' value (UI's 'Actual' column) shows the number of tasks COMPLETED.
            met: completedTasksCount,
            // 'performance' is the percentage difference, rounded to 2 decimal places.
            performance: roundToTwoDecimals(planVsActualPerformance),
        },
        onTime: {
            // The 'base' for on-time tasks is the number of tasks that were COMPLETED.
            base: onTimeBase,
            // The 'met' value (UI's 'Actual' column) shows the number of tasks COMPLETED ON TIME.
            met: onTimeTasksCount,
            // 'performance' is the percentage difference, rounded to 2 decimal places.
            performance: roundToTwoDecimals(onTimePerformance),
        },
        startDate: startDate,
        endDate: endDate,
    };
};

export const getWorkNotDoneTasks = (allTasks: TaskData[], userEmail: string, startDate: Date, endDate: Date): TaskData[] => {
    return allTasks.filter(task => {
        if (task.emailId !== userEmail) return false;
        
        const plannedDate = parseDate(task.plannedDate);
        if (!plannedDate) return false;

        const isPlannedInPeriod = plannedDate >= startDate && plannedDate <= endDate;
        if (!isPlannedInPeriod) return false;

        // "Not done" simply means it has no actual completion date.
        return !task.actualDate;

    }).sort((a,b) => parseDate(a.plannedDate)!.getTime() - parseDate(b.plannedDate)!.getTime());
};

export const getWorkNotDoneOnTimeTasks = (allTasks: TaskData[], userEmail: string, startDate: Date, endDate: Date): TaskData[] => {
    return allTasks.filter(task => {
        if (task.emailId !== userEmail) return false;

        const plannedDate = parseDate(task.plannedDate);
        if (!plannedDate) return false;

        const isPlannedInPeriod = plannedDate >= startDate && plannedDate <= endDate;
        if (!isPlannedInPeriod) return false;

        const actualDate = parseDate(task.actualDate);
        
        // A task is "not done on time" if it was completed, but LATE.
        // It MUST have an actualDate. This is the fix.
        if (!actualDate) {
            return false;
        }

        return actualDate.getTime() > plannedDate.getTime();

    }).sort((a,b) => parseDate(a.plannedDate)!.getTime() - parseDate(b.plannedDate)!.getTime());
};

export const calculateKpiCounts = (tasks: TaskData[], userEmail: string | null): { overdueTasksCount: number, tasksDueTodayCount: number, myPendingTasksCount: number } => {
    if (!userEmail) {
        return { overdueTasksCount: 0, tasksDueTodayCount: 0, myPendingTasksCount: 0 };
    }

    const d = new Date();
    const today = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

    let overdue = 0;
    let dueToday = 0;
    let myTotal = 0;

    tasks.forEach(task => {
        if (task.emailId !== userEmail) return;

        const plannedDate = parseDate(task.plannedDate);
        
        // Tasks without a date are considered pending and should be in the main count.
        if (!plannedDate) {
            myTotal++;
            return;
        }
        
        // Only count tasks due on or before today in the main count.
        if (plannedDate.getTime() <= today.getTime()) {
            myTotal++;
        }
        
        if (plannedDate.getTime() < today.getTime()) {
            overdue++;
        } else if (plannedDate.getTime() === today.getTime()) {
            dueToday++;
        }
    });
    
    return {
        overdueTasksCount: overdue,
        tasksDueTodayCount: dueToday,
        myPendingTasksCount: myTotal,
    };
};

const MONTH_ABBREVIATIONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const calculateHistoricalPerformance = (tasks: TaskData[], userEmail: string): HistoricalDataPoint[] => {
    if (!userEmail) return [];

    const userTasks = tasks.filter(task => task.emailId === userEmail);
    if (userTasks.length === 0) return [];
    
    const history: HistoricalDataPoint[] = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth();
        
        const { startDate, endDate } = getMonthDateRange(year, month);
        
        const tasksPlannedInMonth = userTasks.filter(task => {
            const plannedDate = parseDate(task.plannedDate);
            return plannedDate && plannedDate >= startDate && plannedDate <= endDate;
        });

        const completedTasks = tasksPlannedInMonth.filter(task => task.actualDate);

        const onTimeTasks = completedTasks.filter(task => {
            if (!task.actualDate) return false;
            const actualDate = parseDate(task.actualDate);
            const plannedDate = parseDate(task.plannedDate);
            return actualDate && plannedDate && actualDate.getTime() <= plannedDate.getTime();
        });

        const completionRate = tasksPlannedInMonth.length > 0
            ? Math.round((completedTasks.length / tasksPlannedInMonth.length) * 100)
            : 0;

        // On-Time Rate is based on COMPLETED tasks, not all planned tasks.
        const onTimeRate = completedTasks.length > 0
            ? Math.round((onTimeTasks.length / completedTasks.length) * 100)
            : 0;

        history.push({
            period: `${MONTH_ABBREVIATIONS[month]} '${year.toString().slice(-2)}`,
            completionRate,
            onTimeRate,
        });
    }
    
    return history;
};

export const calculateTeamPerformanceSummary = (tasks: TaskData[], doers: Doer[]): TeamPerformanceSummary => {
    const summary: TeamPerformanceSummary = {
        needsAttention: [],
        onTrack: [],
    };
    
    const { startDate, endDate } = getLastWeekDateRange();

    doers.forEach(doer => {
        const stats = calculateMISStats(tasks, doer.email, startDate, endDate);
        
        if (!stats || stats.planVsActual.base === 0) {
            return; // Skip users with no planned work last week
        }

        // A user needs attention if their performance is negative for either KPI.
        const needsAttention = stats.planVsActual.performance < 0 || stats.onTime.performance < 0;

        if (needsAttention) {
            summary.needsAttention.push(doer);
        } else {
            summary.onTrack.push(doer);
        }
    });

    return summary;
};
