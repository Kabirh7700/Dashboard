
import React from 'react';
import { Doer, TeamPerformanceSummary } from '../types.ts';
import { ExclamationCircleIcon, CheckCircleIcon } from './Icons.tsx';

interface TeamPerformanceHighlightsProps {
    summary: TeamPerformanceSummary | null;
    onSelectEmployee: (email: string) => void;
}

const HighlightCard: React.FC<{ title: string; employees: Doer[]; icon: React.ReactNode; onSelectEmployee: (email: string) => void; color: 'red' | 'green' }> = ({ title, employees, icon, onSelectEmployee, color }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-6">
            <div className="flex items-center gap-3 mb-4">
                {icon}
                <h4 className={`text-lg font-bold ${color === 'red' ? 'text-red-600' : 'text-green-600'}`}>{title}</h4>
                <span className={`flex items-center justify-center h-6 w-6 text-xs font-bold rounded-full text-white ${color === 'red' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {employees.length}
                </span>
            </div>
            {employees.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {employees.map(employee => (
                        <button
                            key={employee.email}
                            onClick={() => onSelectEmployee(employee.email)}
                            className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                        >
                            {employee.name}
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500">No employees in this category for last week.</p>
            )}
        </div>
    );
};


export const TeamPerformanceHighlights: React.FC<TeamPerformanceHighlightsProps> = ({ summary, onSelectEmployee }) => {
    if (!summary) return null;

    return (
        <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Last Week's Team Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HighlightCard 
                    title="Negative score" 
                    employees={summary.needsAttention} 
                    icon={<ExclamationCircleIcon className="h-6 w-6 text-red-500" />} 
                    onSelectEmployee={onSelectEmployee} 
                    color="red"
                />
                <HighlightCard 
                    title="On Track" 
                    employees={summary.onTrack} 
                    icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />} 
                    onSelectEmployee={onSelectEmployee} 
                    color="green"
                />
            </div>
        </section>
    );
};
