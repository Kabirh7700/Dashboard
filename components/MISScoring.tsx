import React from 'react';
import { MISStats } from '../types.ts';
import { formatDateShort } from '../utils/date.ts';

interface MISScoringProps {
    stats: MISStats | null;
    title?: string;
}

export const MISScoring: React.FC<MISScoringProps> = ({ stats, title = "Last Week's Performance" }) => {
    if (!stats) {
        return null; // Don't render if stats are not available
    }

    const { planVsActual, onTime, startDate, endDate } = stats;

    const MetricRow = ({ kra, kpi, base, met, performance }: { kra: string, kpi: string, base: number, met: number, performance: number }) => {
        // Performance is a deviation percentage. 0 is on-target (good), < 0 is under-performance (bad).
        let performanceColor = 'text-green-600';
        if (performance < 0) {
            performanceColor = 'text-red-600';
        }
        
        return (
            <div className="grid grid-cols-12 items-center px-6 py-4">
                <div className="col-span-12 md:col-span-4 text-left text-slate-700 font-medium">{kra}</div>
                <div className="col-span-12 md:col-span-3 text-left text-slate-600">{kpi}</div>
                <div className="col-span-4 md:col-span-2 text-center text-2xl font-bold text-slate-800">{base}</div>
                <div className="col-span-4 md:col-span-2 text-center text-2xl font-bold text-slate-800">{met}</div>
                <div className={`col-span-4 md:col-span-1 text-center text-2xl font-bold ${performanceColor}`}>{performance}%</div>
            </div>
        )
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
                    <div className="col-span-12 md:col-span-4 text-left">KRA</div>
                    <div className="col-span-12 md:col-span-3 text-left">KPI</div>
                    <div className="col-span-4 md:col-span-2 text-center">Planned</div>
                    <div className="col-span-4 md:col-span-2 text-center">Actual</div>
                    <div className="col-span-4 md:col-span-1 text-center">Actual %</div>
                </header>
                <MetricRow 
                    kra="All work should be done as per plan"
                    kpi="% work NOT done"
                    base={planVsActual.base}
                    met={planVsActual.met}
                    performance={planVsActual.performance}
                />
                <MetricRow 
                    kra="All work should be done on time"
                    kpi="% work NOT done on time"
                    base={onTime.base}
                    met={onTime.met}
                    performance={onTime.performance}
                />
            </div>
        </section>
    );
};
