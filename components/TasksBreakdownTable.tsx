import React from 'react';
import { TaskData } from '../types.ts';
import { calculateDelayInDays } from '../utils/date.ts';

interface TasksBreakdownTableProps {
  title: string;
  tasks: TaskData[];
  showDelay?: boolean;
}

export const TasksBreakdownTable: React.FC<TasksBreakdownTableProps> = ({ title, tasks, showDelay = false }) => {
    
    if (tasks.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
                <header className="px-6 py-4 bg-slate-800 text-white">
                    <h3 className="text-lg font-bold">{title}</h3>
                </header>
                <div className="text-center py-10">
                    <p className="text-slate-500">No tasks to display for this category in the selected period.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
            <header className="px-6 py-4 bg-slate-800 text-white">
                <h3 className="text-lg font-bold">{title}</h3>
            </header>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Task ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">System Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Step Code</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Task</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Planned</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actual</th>
                      {showDelay && <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Delay (Days)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70">
                    {tasks.map((task, index) => {
                        const delay = calculateDelayInDays(task.plannedDate, task.actualDate);
                        return (
                            <tr key={`${task.taskId}-${index}`} className="hover:bg-slate-50/70 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{task.taskId || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{task.systemType || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{task.stepCode || '-'}</td>
                                <td className="px-6 py-4 text-sm text-slate-700 max-w-sm break-words">{task.task || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{task.plannedDate || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{task.actualDate || '-'}</td>
                                {showDelay && <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{delay !== null && delay > 0 ? delay : '-'}</td>}
                            </tr>
                        );
                    })}
                  </tbody>
                </table>
            </div>
        </div>
    );
};
