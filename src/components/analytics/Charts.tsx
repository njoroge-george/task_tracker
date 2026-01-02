'use client';

import { useMemo } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { motion } from 'framer-motion';

const CHART_COLORS = {
  aurora: ['#00D9FF', '#00FF94', '#A855F7', '#FF6B9D', '#FFB800', '#00E5A0', '#7C3AED', '#F472B6'],
  cosmic: ['#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#EF4444', '#14B8A6'],
};

const getNivoTheme = () => ({
  background: 'transparent',
  text: { fontSize: 12, fill: '#E5E7EB' },
  axis: {
    domain: { line: { stroke: '#4B5563', strokeWidth: 1 } },
    legend: { text: { fontSize: 13, fill: '#E5E7EB', fontWeight: 600 } },
    ticks: { line: { stroke: '#4B5563', strokeWidth: 1 }, text: { fontSize: 11, fill: '#9CA3AF' } },
  },
  grid: { line: { stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4' } },
  legends: { text: { fontSize: 11, fill: '#D1D5DB' } },
  tooltip: {
    container: {
      background: 'rgba(17, 24, 39, 0.95)',
      color: '#F9FAFB',
      fontSize: 13,
      borderRadius: '12px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      padding: '12px 16px',
      border: '1px solid rgba(139, 92, 246, 0.3)',
    },
  },
});

const ChartWrapper = ({ children, height = 350 }: { children: React.ReactNode; height?: number }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%', height }} className="relative">
    {children}
  </motion.div>
);

interface CompletionTrendChartProps {
  data: Array<{ date: string; completed: number; created: number }>;
}

export function CompletionTrendChart({ data }: CompletionTrendChartProps) {
  const lineData = useMemo(() => [
    { id: 'Created', color: '#00D9FF', data: data.map(d => ({ x: d.date, y: d.created })) },
    { id: 'Completed', color: '#00FF94', data: data.map(d => ({ x: d.date, y: d.completed })) },
  ], [data]);

  return (
    <ChartWrapper height={350}>
      <ResponsiveLine
        data={lineData}
        margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
        curve="catmullRom"
        axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: -45 }}
        axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        colors={['#00D9FF', '#00FF94']}
        lineWidth={3}
        enablePoints={true}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={3}
        pointBorderColor={{ from: 'serieColor' }}
        enableArea={true}
        areaOpacity={0.15}
        useMesh={true}
        theme={getNivoTheme()}
        motionConfig="gentle"
        legends={[{ anchor: 'bottom-right', direction: 'column', translateX: 100, itemsSpacing: 4, itemWidth: 80, itemHeight: 20, symbolSize: 12, symbolShape: 'circle' }]}
      />
    </ChartWrapper>
  );
}

interface DistributionChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title?: string;
}

export function DistributionPieChart({ data }: DistributionChartProps) {
  const pieData = useMemo(() => 
    data.filter(d => d.value > 0).map((item, index) => ({
      id: item.name,
      label: item.name,
      value: item.value,
      color: item.color || CHART_COLORS.aurora[index % CHART_COLORS.aurora.length],
    })),
    [data]
  );

  if (pieData.length === 0) {
    return <ChartWrapper height={300}><div className="flex items-center justify-center h-full text-gray-500">No data available</div></ChartWrapper>;
  }

  return (
    <ChartWrapper height={300}>
      <ResponsivePie
        data={pieData}
        margin={{ top: 30, right: 80, bottom: 30, left: 80 }}
        innerRadius={0.55}
        padAngle={2}
        cornerRadius={6}
        activeOuterRadiusOffset={10}
        colors={{ datum: 'data.color' }}
        borderWidth={2}
        borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
        enableArcLinkLabels={true}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#E5E7EB"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#FFFFFF"
        theme={getNivoTheme()}
        motionConfig="wobbly"
        transitionMode="pushIn"
      />
    </ChartWrapper>
  );
}

interface TeamPerformanceChartProps {
  data: Array<{ name: string; completed: number; total: number }>;
}

export function TeamPerformanceChart({ data }: TeamPerformanceChartProps) {
  const barData = useMemo(() => 
    data.map(item => ({
      member: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
      Completed: item.completed,
      Remaining: item.total - item.completed,
    })),
    [data]
  );

  if (barData.length === 0) {
    return <ChartWrapper height={350}><div className="flex items-center justify-center h-full text-gray-500">No team data available</div></ChartWrapper>;
  }

  return (
    <ChartWrapper height={350}>
      <ResponsiveBar
        data={barData}
        keys={['Completed', 'Remaining']}
        indexBy="member"
        margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        innerPadding={2}
        groupMode="stacked"
        colors={['#00FF94', '#374151']}
        borderRadius={6}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
        axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: -30 }}
        axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#FFFFFF"
        theme={getNivoTheme()}
        motionConfig="gentle"
        legends={[{ dataFrom: 'keys', anchor: 'bottom-right', direction: 'column', translateX: 120, itemsSpacing: 4, itemWidth: 100, itemHeight: 20, symbolSize: 12, symbolShape: 'circle' }]}
      />
    </ChartWrapper>
  );
}

interface ProjectActivityChartProps {
  data: Array<{ name: string; tasks: number; color: string }>;
}

export function ProjectActivityChart({ data }: ProjectActivityChartProps) {
  const barData = useMemo(() => 
    data.map((item, index) => ({
      project: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      tasks: item.tasks,
      color: item.color || CHART_COLORS.cosmic[index % CHART_COLORS.cosmic.length],
    })),
    [data]
  );

  if (barData.length === 0) {
    return <ChartWrapper height={350}><div className="flex items-center justify-center h-full text-gray-500">No project data available</div></ChartWrapper>;
  }

  return (
    <ChartWrapper height={350}>
      <ResponsiveBar
        data={barData}
        keys={['tasks']}
        indexBy="project"
        layout="horizontal"
        margin={{ top: 20, right: 30, bottom: 50, left: 140 }}
        padding={0.3}
        colors={({ data }) => data.color as string}
        borderRadius={6}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
        axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#FFFFFF"
        theme={getNivoTheme()}
        motionConfig="gentle"
      />
    </ChartWrapper>
  );
}
