'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  Sector,
} from "recharts";

interface CompletionTrendChartProps {
  data: Array<{ date: string; completed: number; created: number }>;
}

export function CompletionTrendChart({ data }: CompletionTrendChartProps) {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid #374151',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
            }}
            labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
            itemStyle={{ color: '#D1D5DB' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="created"
            stroke="#3B82F6"
            strokeWidth={3}
            fill="url(#colorCreated)"
            name="Created"
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#10B981"
            strokeWidth={3}
            fill="url(#colorCompleted)"
            name="Completed"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface DistributionChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title: string;
}

// Beautiful color palette for pie charts
const CHART_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

// Render active shape with expansion on hover
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))',
        }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#fff"
        style={{ fontSize: '14px', fontWeight: 'bold' }}
      >
        {payload.name}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#9CA3AF"
        style={{ fontSize: '12px' }}
      >
        {`${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

export function DistributionPieChart({ data, title }: DistributionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Assign colors from palette or use provided colors
  const enhancedData = data.map((item, index) => ({
    ...item,
    color: item.color || CHART_COLORS[index % CHART_COLORS.length],
  }));

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={enhancedData.filter(d => d.value > 0)}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={activeIndex === undefined ? renderCustomizedLabel : false}
            outerRadius={90}
            innerRadius={55}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            stroke="none"
          >
            {enhancedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{
                  filter: activeIndex === index 
                    ? 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5))' 
                    : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
              padding: '12px 16px',
            }}
            itemStyle={{ color: '#D1D5DB', fontWeight: '500' }}
            labelStyle={{ color: '#F9FAFB', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TeamPerformanceChartProps {
  data: Array<{ name: string; completed: number; total: number }>;
}

export function TeamPerformanceChart({ data }: TeamPerformanceChartProps) {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart data={data} barGap={8}>
          <defs>
            <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
              <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#2563EB" stopOpacity={1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="name"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid #374151',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
            }}
            labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
            itemStyle={{ color: '#D1D5DB' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="completed" 
            fill="url(#completedGradient)" 
            name="Completed"
            radius={[8, 8, 0, 0]}
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
            }}
          />
          <Bar 
            dataKey="total" 
            fill="url(#totalGradient)" 
            name="Total Tasks"
            radius={[8, 8, 0, 0]}
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ProjectActivityChartProps {
  data: Array<{ name: string; tasks: number; color: string }>;
}

export function ProjectActivityChart({ data }: ProjectActivityChartProps) {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" barSize={30}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            type="number"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid #374151',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
            }}
            labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
            itemStyle={{ color: '#D1D5DB' }}
          />
          <Bar 
            dataKey="tasks" 
            name="Tasks"
            radius={[0, 8, 8, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
