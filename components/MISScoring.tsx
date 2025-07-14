import React from 'react';
import { MISStats } from '../types.ts';
import { formatDateShort } from '../utils/date.ts';
import { ChevronDownIcon, ChevronUpIcon } from './Icons.tsx';

interface MISScoringProps {
    stats: MISStats | null;
    title?: string;
    activeBreakdown?: 'none' | 'notDone' | 'notOnTime';
    onRowClick?: (breakdown: 'notDone' | 'notOnTime' | 'none') => void;
}

export const MISScoring: React.FC<MISScoringProps> = ({ stats, title = "Last Week's Performance", activeBreakdown, onRowClick }) => {
    if (!stats) {
        return null; // Don't render if stats are not available
    }

    const { planVsActual, onTime, startDate, endDate } = stats;

    const MetricRow = ({ kra, kpi, base, met, performance, breakdownKey }: { kra: string, kpi: string, base: number, met: number, performance: number, breakdownKey: 'notDone' | 'notOnTime' }) => {
        const isClickable = !!onRowClick;
        const isActive = activeBreakdown === breakdownKey;
        
        const handleClick = () => {
            if (onRowClick) {
                onRowClick(isActive ? 'none' : breakdownKey);
            }
        };

        // Performance is now a percentage difference. Negative means below target, 0 or positive is good.
        let performanceColor = 'text-green-600';
        if (performance < 0) {
            performanceColor = 'text-red-600';
        }
        
        const rowContent = (
             <div className="grid grid-cols-12 items-center px-6 py-4">
                <div className="col-span-12 md:col-span-3 text-left text-slate-700 font-medium">{kra}</div>
                <div className="col-span-12 md:col-span-3 text-left text-slate-600">{kpi}</div>
                <div className="col-span-4 md:col-span-2 text-center text-2xl font-bold text-slate-800">{base}</div>
                <div className="col-span-4 md:col-span-2 text-center text-2xl font-bold text-slate-800">{met}</div>
                <div className={`col-span-3 md:col-span-1 text-center text-2xl font-bold ${performanceColor}`}>
                    {performance}%
                </div>
                <div className="col-span-1 flex justify-end items-center">
                    {isClickable && (
                        <span className={`flex items-center justify-center h-7 w-7 rounded-full transition-all duration-200 ${isActive ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'}`}>
                            {isActive 
                                ? <ChevronUpIcon className="h-5 w-5 text-blue-600" /> 
                                : <ChevronDownIcon className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                            }
                        </span>
                    )}
                </div>
            </div>
        );

        if (isClickable) {
            return (
                <button
                    onClick={handleClick}
                    className={`group w-full text-left transition-colors duration-200 hover:bg-slate-50 ${isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    aria-expanded={isActive}
                    aria-controls={`breakdown-${breakdownKey}`}
                >
                    {rowContent}
                </button>
            )
        }
        
        return rowContent;
    };

    return (
        <section>
             <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mb-3">
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <p className="text-sm font-semibold text-slate-500 whitespace-nowrap">
                    ({formatDateShort(startDate)} - {formatDateShort(endDate)})
                </p>
             </div>
             <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden divide-y divide-slate-200/70">
                <header className="grid grid-cols-12 px-6 py-3 bg-slate-50/50 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <div className="col-span-12 md:col-span-3 text-left">KRA</div>
                    <div className="col-span-12 md:col-span-3 text-left">KPI</div>
                    <div className="col-span-4 md:col-span-2 text-center">Planned</div>
                    <div className="col-span-4 md:col-span-2 text-center">Actual</div>
                    <div className="col-span-3 md:col-span-1 text-center">Actual %</div>
                    <div className="col-span-1"></div>
                </header>
                <MetricRow 
                    kra="All work should be done as per plan"
                    kpi="% work NOT done"
                    base={planVsActual.base}
                    met={planVsActual.met}
                    performance={planVsActual.performance}
                    breakdownKey="notDone"
                />
                <MetricRow 
                    kra="All work should be done on time"
                    kpi="% work NOT done on time"
                    base={onTime.base}
                    met={onTime.met}
                    performance={onTime.performance}
                    breakdownKey="notOnTime"
                />
            </div>
        </section>
    );
};
