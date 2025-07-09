
import React, { useState, useMemo, useRef } from 'react';
import { HistoricalDataPoint } from '../types.ts';
import { TrendingUpIcon } from './Icons.tsx';

interface PerformanceTrendChartProps {
  data: HistoricalDataPoint[];
}

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 250; // Made chart more compact
const PADDING = { top: 10, right: 20, bottom: 50, left: 60 }; // Adjusted padding
const CHART_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const points = useMemo(() => {
    if (!data || data.length === 0) return { completion: '', onTime: '' };
    
    const xStep = CHART_WIDTH / (data.length - 1 || 1);
    
    const toPath = (key: 'completionRate' | 'onTimeRate') => 
      data.map((d, i) => {
        const x = PADDING.left + i * xStep;
        const y = PADDING.top + CHART_HEIGHT - (d[key] / 100) * CHART_HEIGHT;
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      }).join(' ');

    return {
      completion: toPath('completionRate'),
      onTime: toPath('onTimeRate'),
    };
  }, [data]);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !data || data.length === 0) return;
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;

    const { x } = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    const xStep = CHART_WIDTH / (data.length - 1 || 1);
    let index = Math.round((x - PADDING.left) / xStep);
    index = Math.max(0, Math.min(data.length - 1, index));
    setHoveredIndex(index);
  };
  
  if (!data || data.length === 0) {
    return (
       <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-3">
              <TrendingUpIcon className="h-6 w-6 text-slate-500" />
              <h3 className="text-lg font-bold text-slate-900">12-Month Performance Trend</h3>
          </div>
          <div className="text-center py-10">
              <p className="text-slate-500">No historical data available for this employee yet.</p>
          </div>
       </div>
    );
  }

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between gap-3 border-b border-slate-200/70">
            <div className="flex items-center gap-3">
                <TrendingUpIcon className="h-6 w-6 text-slate-500" />
                <h3 className="text-lg font-bold text-slate-900">12-Month Performance Trend</h3>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold">
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-500"></div><span className="text-slate-600">Completion Rate</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-green-500"></div><span className="text-slate-600">On-Time Rate</span></div>
            </div>
        </div>
      <div className="p-2 pt-0">
        <svg ref={svgRef} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredIndex(null)} className="w-full">
          {/* Y-Axis Grid Lines and Labels */}
          {[0, 25, 50, 75, 100].map(y => (
            <g key={y}>
              <line 
                x1={PADDING.left} 
                y1={PADDING.top + CHART_HEIGHT - (y / 100) * CHART_HEIGHT}
                x2={PADDING.left + CHART_WIDTH}
                y2={PADDING.top + CHART_HEIGHT - (y / 100) * CHART_HEIGHT}
                stroke="#e2e8f0" 
                strokeWidth="1"
              />
              <text x={PADDING.left - 10} y={PADDING.top + CHART_HEIGHT - (y / 100) * CHART_HEIGHT + 5} textAnchor="end" fill="#64748b" fontSize="14">{y}%</text>
            </g>
          ))}

          {/* X-Axis Labels */}
          {data.map((d, i) => (
            <text 
              key={d.period}
              x={PADDING.left + i * (CHART_WIDTH / (data.length - 1 || 1))} 
              y={SVG_HEIGHT - PADDING.bottom + 20} 
              textAnchor="middle" 
              fill="#64748b" 
              fontSize="14"
            >
              {d.period}
            </text>
          ))}

          {/* Data Lines */}
          <path d={points.completion} fill="none" stroke="#3b82f6" strokeWidth="3" />
          <path d={points.onTime} fill="none" stroke="#22c55e" strokeWidth="3" />

          {/* Interactive Tooltip */}
          {hoveredData && hoveredIndex !== null && (
            <g>
              <line 
                x1={PADDING.left + hoveredIndex * (CHART_WIDTH / (data.length - 1 || 1))} 
                y1={PADDING.top}
                x2={PADDING.left + hoveredIndex * (CHART_WIDTH / (data.length - 1 || 1))} 
                y2={PADDING.top + CHART_HEIGHT}
                stroke="#94a3b8" 
                strokeWidth="1"
                strokeDasharray="4"
              />
              <circle 
                cx={PADDING.left + hoveredIndex * (CHART_WIDTH / (data.length - 1 || 1))} 
                cy={PADDING.top + CHART_HEIGHT - (hoveredData.completionRate / 100) * CHART_HEIGHT}
                r="6" fill="#3b82f6" stroke="white" strokeWidth="2"
              />
              <circle 
                cx={PADDING.left + hoveredIndex * (CHART_WIDTH / (data.length - 1 || 1))} 
                cy={PADDING.top + CHART_HEIGHT - (hoveredData.onTimeRate / 100) * CHART_HEIGHT}
                r="6" fill="#22c55e" stroke="white" strokeWidth="2"
              />
              <g transform={`translate(${PADDING.left + hoveredIndex * (CHART_WIDTH / (data.length - 1 || 1)) + 10}, ${PADDING.top + 10})`}>
                  <rect x="0" y="0" width="160" height="70" rx="8" fill="rgba(15, 23, 42, 0.8)" />
                  <text x="10" y="25" fill="white" fontSize="16" fontWeight="bold">{hoveredData.period}</text>
                  <text x="10" y="45" fill="#3b82f6" fontSize="14">Completion: {hoveredData.completionRate}%</text>
                  <text x="10" y="65" fill="#22c55e" fontSize="14">On-Time: {hoveredData.onTimeRate}%</text>
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};