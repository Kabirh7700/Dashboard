import React from 'react';
import { Doer } from '../types.ts';
import { UserCircleIcon } from './Icons.tsx';

interface EmployeeProfileCardProps {
    doer: Doer;
}

export const EmployeeProfileCard: React.FC<EmployeeProfileCardProps> = ({ doer }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
                {doer.imageUrl ? (
                    <img 
                        src={doer.imageUrl} 
                        alt={doer.name}
                        className="h-28 w-28 rounded-full object-cover ring-4 ring-offset-2 ring-blue-500"
                        // Handle image loading errors gracefully
                        onError={(e) => { (e.target as HTMLImageElement).src = 'about:blank'; (e.target as HTMLImageElement).style.display='none'; }}
                    />
                ) : (
                    <UserCircleIcon className="h-28 w-28 text-slate-300" />
                )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{doer.name}</h2>
            <p className="text-sm text-slate-500">{doer.email}</p>
        </div>
    )
}