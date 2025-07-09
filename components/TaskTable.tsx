import React from 'react';
import { TaskData } from '../types.ts';
import { DocumentCheckIcon, ChevronUpIcon, ChevronDownIcon } from './Icons.tsx';

interface TaskTableProps {
  tasks: TaskData[];
  currentUserEmail: string | null;
  onSort: (key: keyof TaskData) => void;
  sortConfig: { key: keyof TaskData | null, direction: string };
}

const SortableHeader: React.FC<{ title: string; sortKey: keyof TaskData; onSort: (key: keyof TaskData) => void; sortConfig: { key: keyof TaskData | null, direction: string } }> = ({ title, sortKey, onSort, sortConfig }) => {
    const isSorted = sortConfig.key === sortKey;
    const directionIcon = sortConfig.direction === 'ascending' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />;

    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
            <button onClick={() => onSort(sortKey)} className="flex items-center gap-1.5 group transition-colors hover:text-slate-900">
                <span>{title}</span>
                <span className={`transition-opacity ${isSorted ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}>
                    {directionIcon}
                </span>
            </button>
        </th>
    )
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, currentUserEmail, onSort, sortConfig }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-slate-200/50">
        <h3 className="text-lg font-medium text-slate-700">No matching tasks found.</h3>
        <p className="text-slate-500 mt-1">
          {currentUserEmail 
            ? "You have no pending tasks that match the current filters." 
            : "Try adjusting the filters or set your user email in the header."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
        <header className="px-6 py-4 border-b border-slate-200/70">
            <h3 className="text-lg font-bold text-slate-900">Active Tasks (Overdue & Due Today)</h3>
        </header>
        <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <SortableHeader title="Task ID" sortKey="taskId" onSort={onSort} sortConfig={sortConfig} />
                  <SortableHeader title="System Type" sortKey="systemType" onSort={onSort} sortConfig={sortConfig} />
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Task</th>
                  <SortableHeader title="Planned" sortKey="plannedDate" onSort={onSort} sortConfig={sortConfig} />
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Doer Name</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {tasks.map((task, index) => (
                  <tr key={`${task.taskId}-${index}`} className="hover:bg-slate-50/70 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{task.taskId || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{task.systemType || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 max-w-sm break-words">{task.task || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{task.plannedDate || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{task.doerName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {task.formLink ? (
                        <a
                          href={task.formLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-200 hover:text-blue-800 transition-all"
                        >
                          Mark Done
                          <DocumentCheckIcon className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-slate-400">No Link</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
    </div>
  );
};