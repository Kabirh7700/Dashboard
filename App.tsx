
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { TaskTable } from './components/TaskTable.tsx';
import { Loader } from './components/Loader.tsx';
import { fetchTasks, fetchAttendanceData } from './services/googleSheetService.ts';
import { TaskData, MISStats, Doer, RawWeeklyAttendance, AttendanceStats } from './types.ts';
import { Dashboard } from './components/Dashboard.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { MISScoring } from './components/MISScoring.tsx';
import { calculateKpiCounts, calculateMISStats, getWorkNotDoneOnTimeTasks, getWorkNotDoneTasks } from './utils/stats.ts';
import { parseDate, getLastWeekDateRange } from './utils/date.ts';
import { EmployeeMISView } from './components/EmployeeMISView.tsx';
import { ADMIN_EMAILS, BOSS_EMAIL } from './constants.ts';
import { EmployeeProfileCard } from './components/EmployeeProfileCard.tsx';
import { AttendanceReport } from './components/AttendanceReport.tsx';
import { calculateAttendanceStats } from './utils/attendance.ts';
import { TasksBreakdownTable } from './components/TasksBreakdownTable.tsx';


const App: React.FC = () => {
  const [allTasks, setAllTasks] = useState<TaskData[]>([]);
  const [rawWeeklyAttendance, setRawWeeklyAttendance] = useState<RawWeeklyAttendance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => localStorage.getItem('taskDashboardUserEmail'));
  const [view, setView] = useState<'dashboard' | 'employeeMIS'>('dashboard');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof TaskData | null, direction: 'ascending' | 'descending' }>({ key: 'plannedDate', direction: 'ascending' });
  const [kpiFilter, setKpiFilter] = useState<'all' | 'overdue' | 'dueToday'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [visibleBreakdown, setVisibleBreakdown] = useState<'none' | 'notDone' | 'notOnTime'>('none');

  const isAdmin = useMemo(() => ADMIN_EMAILS.includes(currentUserEmail ?? ''), [currentUserEmail]);
  const isBoss = useMemo(() => currentUserEmail === BOSS_EMAIL, [currentUserEmail]);

  const fetchAndSetData = useCallback(async () => {
    setError(null);
    try {
      const [tasks, attendance] = await Promise.all([
        fetchTasks(),
        fetchAttendanceData()
      ]);
      setAllTasks(tasks);
      setRawWeeklyAttendance(attendance);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  }, []);

  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await fetchAndSetData();
      setIsLoading(false);
    };

    initialFetch();

    const intervalId = setInterval(() => {
      fetchAndSetData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchAndSetData]);

  useEffect(() => {
    if (isBoss) {
      setView('employeeMIS');
    }
  }, [isBoss, currentUserEmail]);


  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAndSetData();
    setIsRefreshing(false);
  }, [fetchAndSetData]);
  
  const allDoers: Doer[] = useMemo(() => {
    const doers = new Map<string, Doer>();
    allTasks.forEach(task => {
        if (task.emailId && task.doerName && !doers.has(task.emailId)) {
            doers.set(task.emailId, { 
                email: task.emailId, 
                name: task.doerName, 
                imageUrl: task.doerImageUrl || '' 
            });
        }
    });
    return Array.from(doers.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allTasks]);

  const currentUser = useMemo(() => {
    return allDoers.find(d => d.email === currentUserEmail);
  }, [allDoers, currentUserEmail]);

  const pendingTasks = useMemo(() => {
    return allTasks.filter(task => !task.actualDate);
  }, [allTasks]);

  const misStats: MISStats | null = useMemo(() => {
    const { startDate, endDate } = getLastWeekDateRange();
    return calculateMISStats(allTasks, currentUserEmail, startDate, endDate);
  }, [allTasks, currentUserEmail]);

  const { workNotDone, workNotDoneOnTime } = useMemo(() => {
    if (!currentUserEmail) return { workNotDone: [], workNotDoneOnTime: [] };
    const { startDate, endDate } = getLastWeekDateRange();
    return {
        workNotDone: getWorkNotDoneTasks(allTasks, currentUserEmail, startDate, endDate),
        workNotDoneOnTime: getWorkNotDoneOnTimeTasks(allTasks, currentUserEmail, startDate, endDate)
    };
  }, [allTasks, currentUserEmail]);

  const handleBreakdownToggle = useCallback((breakdown: 'none' | 'notDone' | 'notOnTime') => {
      setVisibleBreakdown(current => (current === breakdown ? 'none' : breakdown));
  }, []);

  const attendanceStats: AttendanceStats | null = useMemo(() => {
    const { startDate, endDate } = getLastWeekDateRange();
    if (!currentUserEmail || !allDoers.length) return null;

    const stats = calculateAttendanceStats(rawWeeklyAttendance, currentUserEmail, allDoers);
    const defaultStats = { totalWorkingDays: 5, presentDays: 0, attendancePercentage: 0 };

    return {
        ...(stats || defaultStats),
        startDate: startDate,
        endDate: endDate,
    };
  }, [rawWeeklyAttendance, currentUserEmail, allDoers]);

  const { overdueTasksCount, tasksDueTodayCount, myPendingTasksCount } = useMemo(() => calculateKpiCounts(pendingTasks, currentUserEmail), [pendingTasks, currentUserEmail]);

  const displayTasks = useMemo(() => {
    const d = new Date();
    const today = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    let filteredTasks = pendingTasks.filter(task => {
      const userMatch = !currentUserEmail || task.emailId === currentUserEmail;
      
      const searchMatch = !searchTerm ||
        task.taskId.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.task.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.systemType.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.doerName.toLowerCase().includes(lowerCaseSearchTerm);

      if (!(userMatch && searchMatch)) {
        return false;
      }

      const planned = parseDate(task.plannedDate);

      if (kpiFilter === 'all') {
        // "My Pending Tasks" shows tasks due on or before today, or tasks with no planned date.
        if (!planned) return true; // Include tasks without a date
        return planned.getTime() <= today.getTime();
      }

      // Other filters require a planned date.
      if (!planned) return false;

      if (kpiFilter === 'overdue') {
        return planned.getTime() < today.getTime();
      }

      if (kpiFilter === 'dueToday') {
        return planned.getTime() === today.getTime();
      }
      
      return false;
    });

    if (sortConfig.key) {
      const sortableTasks = [...filteredTasks];
      const sortKey = sortConfig.key;
      sortableTasks.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        let comparison = 0;
        if (sortKey === 'plannedDate') {
          const dateA = parseDate(valA as string);
          const dateB = parseDate(valB as string);
          if (dateA && dateB) {
            comparison = dateA.getTime() - dateB.getTime();
          }
        } else {
          if (valA! < valB!) {
            comparison = -1;
          }
          if (valA! > valB!) {
            comparison = 1;
          }
        }
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
      return sortableTasks;
    }

    return filteredTasks;
  }, [pendingTasks, currentUserEmail, kpiFilter, sortConfig, searchTerm]);

  const handleSort = (key: keyof TaskData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleLogin = (email: string) => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCurrentUserEmail(email);
      localStorage.setItem('taskDashboardUserEmail', email);
    } else {
      alert("Please enter a valid email address.");
    }
  };

  const handleLogout = useCallback(() => {
    setCurrentUserEmail(null);
    localStorage.removeItem('taskDashboardUserEmail');
    setView('dashboard'); // Reset view on logout
  }, []);

  if (!currentUserEmail) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-200 text-slate-900">
      <Header
        onRefresh={handleManualRefresh}
        isLoading={isRefreshing}
        currentUserEmail={currentUser?.name || currentUserEmail}
        currentUserImageUrl={currentUser?.imageUrl}
        onLogout={handleLogout}
        lastRefreshed={lastRefreshed}
        isAdmin={isAdmin}
        isBoss={isBoss}
        currentView={view}
        onViewChange={setView}
      />
      <div className="max-w-screen-xl mx-auto p-4 md:p-6 space-y-8">
        {view === 'dashboard' && !isBoss ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1 space-y-8">
                {currentUser && <EmployeeProfileCard doer={currentUser} />}
                <AttendanceReport stats={attendanceStats} title="My Weekly Attendance" />
              </div>
              <div className="lg:col-span-2 space-y-8">
                <MISScoring 
                  stats={misStats} 
                  title="My Weekly Performance"
                  activeBreakdown={visibleBreakdown}
                  onRowClick={handleBreakdownToggle} 
                />
                 <div className="transition-all duration-300">
                    {visibleBreakdown === 'notDone' && (
                        <TasksBreakdownTable
                            title={`Work NOT Done (${workNotDone.length} Tasks)`}
                            tasks={workNotDone}
                        />
                    )}
                    {visibleBreakdown === 'notOnTime' && (
                        <TasksBreakdownTable
                            title={`Work NOT Done On Time (${workNotDoneOnTime.length} Tasks)`}
                            tasks={workNotDoneOnTime}
                            showDelay={true}
                        />
                    )}
                </div>
                <Dashboard
                  overdueTasksCount={overdueTasksCount}
                  tasksDueTodayCount={tasksDueTodayCount}
                  myPendingTasksCount={myPendingTasksCount}
                  kpiFilter={kpiFilter}
                  onKpiFilterChange={setKpiFilter}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </div>
            </div>

            <main>
              {isLoading ? (
                <Loader />
              ) : error ? (
                <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold">Failed to load data</h3>
                  <p className="mt-2">{error}</p>
                  {error.includes("429") && <p className="mt-2 text-sm">This is due to too many requests. The data will attempt to refresh again automatically.</p>}
                </div>
              ) : (
                <TaskTable
                  tasks={displayTasks}
                  currentUserEmail={currentUserEmail}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  kpiFilter={kpiFilter}
                />
              )}
            </main>
          </>
        ) : isAdmin ? (
          <EmployeeMISView allTasks={allTasks} allDoers={allDoers} rawWeeklyAttendance={rawWeeklyAttendance} />
        ) : (
          <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Access Denied</h3>
              <p className="mt-2">You do not have permission to view this page.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

