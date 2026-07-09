'use client';

import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CHART_COLORS = ['#FF6B35', '#22C55E', '#FBBF24', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

interface ChartDataPoint {
  [key: string]: string | number;
}

type ChartType = 'line' | 'bar' | 'pie' | 'horizontal-bar';

interface AnalyticsChartProps {
  type: ChartType;
  data: ChartDataPoint[];
  dataKeys: string[];
  xKey?: string;
  height?: number;
  colors?: string[];
  showGrid?: boolean;
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#1A2332',
    border: '1px solid #2D3748',
    borderRadius: '8px',
    color: '#F9FAFB',
  },
};

export function AnalyticsChart({
  type, data, dataKeys, xKey = 'name',
  height = 200, colors = CHART_COLORS, showGrid = true,
}: AnalyticsChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted text-sm">
        No data available
      </div>
    );
  }

  const grid = showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" /> : null;

  switch (type) {
    case 'line':
      return (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              {grid}
              <XAxis dataKey={xKey} stroke="#6B7280" fontSize={10} />
              <YAxis stroke="#6B7280" fontSize={10} />
              <Tooltip {...tooltipStyle} />
              {dataKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[i % colors.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );

    case 'bar':
      return (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              {grid}
              <XAxis dataKey={xKey} stroke="#6B7280" fontSize={9} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#6B7280" fontSize={10} />
              <Tooltip {...tooltipStyle} />
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} radius={[4, 4, 0, 0]} fill={colors[i % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'horizontal-bar':
      return (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              {grid}
              <XAxis type="number" stroke="#6B7280" fontSize={10} />
              <YAxis dataKey={xKey} type="category" stroke="#6B7280" fontSize={9} width={90} />
              <Tooltip {...tooltipStyle} />
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[0, 4, 4, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'pie':
      return (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey={dataKeys[0]}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      );
  }
}
