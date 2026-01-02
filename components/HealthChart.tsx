"use client"

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface ChartDataPoint {
    date: string;
    up: number;
    down: number;
}

interface HealthChartProps {
    data: ChartDataPoint[];
    isMinimal?: boolean;
}

export function HealthChart({ data, isMinimal = false }: HealthChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full min-h-[100px] flex items-center justify-center bg-gray-50/50 dark:bg-gray-950/20 rounded-[1.5rem] border border-dashed border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Trend Data</p>
            </div>
        )
    }

    return (
        <div className="h-full w-full transition-all">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 5,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={isMinimal ? 0.05 : 0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={isMinimal ? 0.05 : 0.1} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    {!isMinimal && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />}
                    <XAxis
                        dataKey="date"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#9CA3AF' }}
                        hide={isMinimal}
                    />
                    <YAxis
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#9CA3AF' }}
                        hide={isMinimal}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #F3F4F6',
                            fontSize: '11px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '8px'
                        }}
                    />
                    {!isMinimal && <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />}
                    <Area
                        type="monotone"
                        dataKey="up"
                        name="Healthy"
                        stroke="#10b981"
                        strokeWidth={isMinimal ? 1.5 : 2}
                        fillOpacity={1}
                        fill="url(#colorUp)"
                        stackId="1"
                        isAnimationActive={!isMinimal}
                    />
                    <Area
                        type="monotone"
                        dataKey="down"
                        name="Issues"
                        stroke="#ef4444"
                        strokeWidth={isMinimal ? 1.5 : 2}
                        fillOpacity={1}
                        fill="url(#colorDown)"
                        stackId="1"
                        isAnimationActive={!isMinimal}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
