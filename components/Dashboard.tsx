
import React from 'react';
import { UserIcon, CalendarIcon, ExclamationTriangleIcon, SearchIcon, CloseIcon } from './Icons.tsx';

interface DashboardProps {
  overdueTasksCount: number;
  tasksDueTodayCount: number;
  myPendingTasksCount: number;
  kpiFilter: 'all' | 'overdue' | 'dueToday';
  onKpiFilterChange: (filter: 'all' | 'overdue' | 'dueToday') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; onClick: () => void; isActive: boolean }> = ({ title, value, icon, onClick, isActive }) => {
    const activeClasses = isActive ? 'ring-2 ring-blue-500 ring-offset-2 shadow-2xl' : 'shadow-lg';
    return (
        <button 
            onClick={onClick}
            className={`bg-white p-5 rounded-xl border border-slate-200/50 flex items-center gap-5 text-left w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none ${activeClasses}`}
        >
            <div className={`rounded-full p-4 ${isActive ? 'bg-blue-100' : 'bg-slate-100'}`}>{icon}</div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
            </div>
        </button>
    )
};


export const Dashboard: React.FC<DashboardProps> = (props) => {
    const {
        overdueTasksCount, tasksDueTodayCount, myPendingTasksCount,
        kpiFilter, onKpiFilterChange,
        searchTerm, onSearchChange
    } = props;

  return (
    <section className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="My Pending Tasks" value={myPendingTasksCount} icon={<UserIcon className="h-8 w-8 text-blue-600" />} onClick={() => onKpiFilterChange('all')} isActive={kpiFilter === 'all'} />
        <KpiCard title="Overdue Tasks" value={overdueTasksCount} icon={<ExclamationTriangleIcon className="h-8 w-8 text-red-600" />} onClick={() => onKpiFilterChange('overdue')} isActive={kpiFilter === 'overdue'} />
        <KpiCard title="Tasks Due Today" value={tasksDueTodayCount} icon={<CalendarIcon className="h-8 w-8 text-amber-600" />} onClick={() => onKpiFilterChange('dueToday')} isActive={kpiFilter === 'dueToday'} />
      </div>

      {/* Filter Controls */}
      <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Search Tasks</h3>
          
          <div className="relative">
              <label htmlFor="search-filter" className="sr-only">Search</label>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <SearchIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                  id="search-filter"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search by ID, task, system, doer..."
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base py-2.5 pl-11 pr-10 transition-all"
              />
              {searchTerm && (
                  <button onClick={() => onSearchChange('')} className="absolute inset-y-0 right-0 flex items-center pr-3 group" aria-label="Clear search">
                      <CloseIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>
              )}
          </div>
      </div>
    </section>
  );
};
