'use client';

import { useState, useMemo } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveRadialBar } from '@nivo/radial-bar';
import { ResponsiveRadar } from '@nivo/radar';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// PREMIUM COLOR PALETTES - Ultra Premium Aurora & Cosmic Themes
// ============================================================================

export const NOVA_PALETTES = {
  // Aurora Borealis - Stunning northern lights inspired
  aurora: [
    '#00D9FF', // Cyan glow
    '#00FF94', // Emerald spark
    '#A855F7', // Purple dream
    '#FF6B9D', // Pink sunset
    '#FFB800', // Golden hour
    '#00E5A0', // Mint fresh
    '#7C3AED', // Violet deep
    '#F472B6', // Rose bloom
  ],
  // Cosmic Night - Deep space elegance
  cosmic: [
    '#8B5CF6', // Violet nebula
    '#06B6D4', // Cyan star
    '#F59E0B', // Solar flare
    '#EC4899', // Pink galaxy
    '#10B981', // Green aurora
    '#3B82F6', // Blue planet
    '#EF4444', // Red giant
    '#14B8A6', // Teal comet
  ],
  // Neon Dreams - Vibrant cyberpunk
  neon: [
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FF6600', // Orange
    '#00FF00', // Lime
    '#FF0066', // Hot pink
    '#6600FF', // Purple
    '#FFFF00', // Yellow
    '#00FF99', // Mint
  ],
  // Sunset Gradient - Warm and inviting
  sunset: [
    '#FF6B6B', // Coral
    '#FFA06B', // Peach
    '#FFD93D', // Sunflower
    '#6BCB77', // Sage
    '#4D96FF', // Sky
    '#9B59B6', // Amethyst
    '#E74C3C', // Crimson
    '#1ABC9C', // Turquoise
  ],
  // Professional - Clean corporate look
  professional: [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
  ],
};

// ============================================================================
// PREMIUM THEME CONFIGURATION
// ============================================================================

const getNovaTheme = (isDark: boolean = true) => ({
  background: 'transparent',
  text: {
    fontSize: 12,
    fill: isDark ? '#E5E7EB' : '#374151',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  axis: {
    domain: {
      line: {
        stroke: isDark ? '#4B5563' : '#D1D5DB',
        strokeWidth: 1,
      },
    },
    legend: {
      text: {
        fontSize: 13,
        fill: isDark ? '#E5E7EB' : '#374151',
        fontWeight: 600,
      },
    },
    ticks: {
      line: {
        stroke: isDark ? '#4B5563' : '#D1D5DB',
        strokeWidth: 1,
      },
      text: {
        fontSize: 11,
        fill: isDark ? '#9CA3AF' : '#6B7280',
      },
    },
  },
  grid: {
    line: {
      stroke: isDark ? '#374151' : '#E5E7EB',
      strokeWidth: 1,
      strokeDasharray: '4 4',
    },
  },
  legends: {
    title: {
      text: {
        fontSize: 12,
        fill: isDark ? '#E5E7EB' : '#374151',
        fontWeight: 600,
      },
    },
    text: {
      fontSize: 11,
      fill: isDark ? '#D1D5DB' : '#4B5563',
    },
    ticks: {
      line: {},
      text: {
        fontSize: 10,
        fill: isDark ? '#9CA3AF' : '#6B7280',
      },
    },
  },
  tooltip: {
    container: {
      background: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      color: isDark ? '#F9FAFB' : '#111827',
      fontSize: 13,
      borderRadius: '12px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(139, 92, 246, 0.15)',
      padding: '12px 16px',
      border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
      backdropFilter: 'blur(10px)',
    },
  },
  labels: {
    text: {
      fontSize: 12,
      fontWeight: 600,
      fill: '#FFFFFF',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    },
  },
  annotations: {
    text: {
      fontSize: 13,
      fill: isDark ? '#E5E7EB' : '#374151',
      fontWeight: 500,
    },
  },
});

// ============================================================================
// CUSTOM TOOLTIP COMPONENTS
// ============================================================================

interface TooltipProps {
  id: string | number;
  value: number;
  color: string;
  label?: string;
  indexValue?: string | number;
  formattedValue?: string;
}

const PremiumTooltip = ({ id, value, color, label }: TooltipProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl"
    style={{
      boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${color}20`,
    }}
  >
    <div
      className="w-4 h-4 rounded-full shadow-lg"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 20px ${color}80`,
      }}
    />
    <div className="flex flex-col">
      <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
        {label || id}
      </span>
      <span className="text-white text-lg font-bold">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  </motion.div>
);

const BarTooltip = ({ id, value, color, indexValue }: TooltipProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl"
    style={{
      boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${color}20`,
    }}
  >
    <div
      className="w-4 h-4 rounded-full shadow-lg"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 20px ${color}80`,
      }}
    />
    <div className="flex flex-col">
      <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
        {indexValue} - {id}
      </span>
      <span className="text-white text-lg font-bold">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  </motion.div>
);

// ============================================================================
// CHART WRAPPER WITH PREMIUM EFFECTS
// ============================================================================

interface ChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  height?: number;
  glowColor?: string;
}

export const NovaChartWrapper = ({
  children,
  title,
  subtitle,
  height = 350,
  glowColor = '#8B5CF6',
}: ChartWrapperProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="relative group"
  >
    {/* Ambient glow effect */}
    <div
      className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${glowColor}40, transparent 70%)`,
      }}
    />
    
    <div className="relative rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950/90 backdrop-blur-xl border border-gray-800/50 overflow-hidden">
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
        }}
      />
      
      {title && (
        <div className="px-6 pt-5 pb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: glowColor,
                boxShadow: `0 0 10px ${glowColor}`,
              }}
            />
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      <div style={{ height }} className="px-4 pb-4">
        {children}
      </div>
    </div>
  </motion.div>
);

// ============================================================================
// PREMIUM PIE CHART - Interactive Donut with Glow Effects
// ============================================================================

interface PieChartData {
  id: string;
  label: string;
  value: number;
  color?: string;
}

interface NovaPieChartProps {
  data: PieChartData[];
  title?: string;
  subtitle?: string;
  palette?: keyof typeof NOVA_PALETTES;
  showLegend?: boolean;
  innerRadius?: number;
  enableArcLinkLabels?: boolean;
}

export const NovaPieChart = ({
  data,
  title,
  subtitle,
  palette = 'aurora',
  showLegend = true,
  innerRadius = 0.6,
  enableArcLinkLabels = true,
}: NovaPieChartProps) => {
  const colors = NOVA_PALETTES[palette];
  
  const enhancedData = useMemo(() => 
    data.map((item, index) => ({
      ...item,
      color: item.color || colors[index % colors.length],
    })),
    [data, colors]
  );

  return (
    <NovaChartWrapper title={title} subtitle={subtitle} height={380} glowColor={colors[0]}>
      <ResponsivePie
        data={enhancedData}
        margin={{ top: 40, right: 120, bottom: 40, left: 120 }}
        innerRadius={innerRadius}
        padAngle={2}
        cornerRadius={6}
        activeOuterRadiusOffset={12}
        colors={{ datum: 'data.color' }}
        borderWidth={2}
        borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
        enableArcLinkLabels={enableArcLinkLabels}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#E5E7EB"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#FFFFFF"
        theme={getNovaTheme()}
        motionConfig="wobbly"
        transitionMode="pushIn"
        tooltip={({ datum }) => (
          <PremiumTooltip
            id={String(datum.id)}
            value={datum.value}
            color={datum.color}
            label={String(datum.label)}
          />
        )}
        legends={showLegend ? [
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 40,
            itemsSpacing: 16,
            itemWidth: 80,
            itemHeight: 18,
            itemTextColor: '#9CA3AF',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 12,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#FFFFFF',
                },
              },
            ],
          },
        ] : []}
        defs={[
          {
            id: 'dots',
            type: 'patternDots',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: 'lines',
            type: 'patternLines',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
      />
    </NovaChartWrapper>
  );
};

// ============================================================================
// PREMIUM BAR CHART - Gradient Bars with Hover Effects
// ============================================================================

interface BarChartData {
  [key: string]: string | number;
}

interface NovaBarChartProps {
  data: BarChartData[];
  keys: string[];
  indexBy: string;
  title?: string;
  subtitle?: string;
  palette?: keyof typeof NOVA_PALETTES;
  layout?: 'vertical' | 'horizontal';
  groupMode?: 'grouped' | 'stacked';
  showLegend?: boolean;
}

export const NovaBarChart = ({
  data,
  keys,
  indexBy,
  title,
  subtitle,
  palette = 'aurora',
  layout = 'vertical',
  groupMode = 'grouped',
  showLegend = true,
}: NovaBarChartProps) => {
  const colors = NOVA_PALETTES[palette];

  return (
    <NovaChartWrapper title={title} subtitle={subtitle} height={380} glowColor={colors[0]}>
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy={indexBy}
        margin={{ top: 20, right: showLegend ? 130 : 20, bottom: 50, left: 60 }}
        padding={0.3}
        innerPadding={3}
        groupMode={groupMode}
        layout={layout}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={colors}
        borderRadius={6}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendPosition: 'middle',
          legendOffset: 40,
          truncateTickAt: 0,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendPosition: 'middle',
          legendOffset: -50,
          truncateTickAt: 0,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#FFFFFF"
        theme={getNovaTheme()}
        motionConfig="gentle"
        tooltip={({ id, value, color, indexValue }) => (
          <BarTooltip
            id={id}
            value={value}
            color={color}
            indexValue={indexValue}
          />
        )}
        legends={showLegend ? [
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 4,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 12,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ] : []}
        role="application"
        ariaLabel="Bar chart"
      />
    </NovaChartWrapper>
  );
};

// ============================================================================
// PREMIUM LINE CHART - Smooth Gradients with Area Fill
// ============================================================================

interface LineChartSeries {
  id: string;
  data: Array<{ x: string | number; y: number }>;
  color?: string;
}

interface NovaLineChartProps {
  data: LineChartSeries[];
  title?: string;
  subtitle?: string;
  palette?: keyof typeof NOVA_PALETTES;
  enableArea?: boolean;
  curve?: 'linear' | 'cardinal' | 'catmullRom' | 'monotoneX' | 'monotoneY' | 'natural' | 'step' | 'stepAfter' | 'stepBefore';
  showLegend?: boolean;
  enablePoints?: boolean;
}

export const NovaLineChart = ({
  data,
  title,
  subtitle,
  palette = 'aurora',
  enableArea = true,
  curve = 'catmullRom',
  showLegend = true,
  enablePoints = true,
}: NovaLineChartProps) => {
  const colors = NOVA_PALETTES[palette];
  
  const enhancedData = useMemo(() => 
    data.map((series, index) => ({
      ...series,
      color: series.color || colors[index % colors.length],
    })),
    [data, colors]
  );

  return (
    <NovaChartWrapper title={title} subtitle={subtitle} height={380} glowColor={colors[0]}>
      <ResponsiveLine
        data={enhancedData}
        margin={{ top: 20, right: showLegend ? 130 : 30, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: false,
          reverse: false,
        }}
        curve={curve}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendOffset: 40,
          legendPosition: 'middle',
          truncateTickAt: 0,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendOffset: -50,
          legendPosition: 'middle',
          truncateTickAt: 0,
        }}
        colors={{ datum: 'color' }}
        lineWidth={3}
        enablePoints={enablePoints}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={3}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        enableArea={enableArea}
        areaOpacity={0.15}
        areaBlendMode="screen"
        useMesh={true}
        theme={getNovaTheme()}
        motionConfig="gentle"
        crosshairType="cross"
        tooltip={({ point }) => (
          <PremiumTooltip
            id={String(point.seriesId)}
            value={point.data.y as number}
            color={point.color}
            label={`${point.data.x}`}
          />
        )}
        legends={showLegend ? [
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 4,
            itemDirection: 'left-to-right',
            itemWidth: 100,
            itemHeight: 20,
            itemOpacity: 0.85,
            symbolSize: 12,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ] : []}
        defs={[
          {
            id: 'gradientA',
            type: 'linearGradient',
            colors: [
              { offset: 0, color: colors[0], opacity: 0.6 },
              { offset: 100, color: colors[0], opacity: 0 },
            ],
          },
          {
            id: 'gradientB',
            type: 'linearGradient',
            colors: [
              { offset: 0, color: colors[1], opacity: 0.6 },
              { offset: 100, color: colors[1], opacity: 0 },
            ],
          },
        ]}
      />
    </NovaChartWrapper>
  );
};

// ============================================================================
// PREMIUM RADIAL BAR CHART - Circular Progress Visualization
// ============================================================================

interface RadialBarData {
  id: string;
  data: Array<{ x: string; y: number }>;
}

interface NovaRadialBarChartProps {
  data: RadialBarData[];
  title?: string;
  subtitle?: string;
  palette?: keyof typeof NOVA_PALETTES;
  maxValue?: number;
}

export const NovaRadialBarChart = ({
  data,
  title,
  subtitle,
  palette = 'aurora',
  maxValue = 100,
}: NovaRadialBarChartProps) => {
  const colors = NOVA_PALETTES[palette];

  return (
    <NovaChartWrapper title={title} subtitle={subtitle} height={350} glowColor={colors[0]}>
      <ResponsiveRadialBar
        data={data}
        maxValue={maxValue}
        padding={0.4}
        cornerRadius={4}
        margin={{ top: 40, right: 120, bottom: 40, left: 40 }}
        colors={colors}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
        enableTracks={true}
        tracksColor="rgba(255, 255, 255, 0.1)"
        enableRadialGrid={true}
        enableCircularGrid={true}
        radialAxisStart={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        circularAxisOuter={{ tickSize: 5, tickPadding: 12, tickRotation: 0 }}
        theme={getNovaTheme()}
        motionConfig="gentle"
        legends={[
          {
            anchor: 'right',
            direction: 'column',
            justify: false,
            translateX: 80,
            translateY: 0,
            itemsSpacing: 6,
            itemDirection: 'left-to-right',
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: '#9CA3AF',
            symbolSize: 12,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#FFFFFF',
                },
              },
            ],
          },
        ]}
      />
    </NovaChartWrapper>
  );
};

// ============================================================================
// PREMIUM RADAR CHART - Spider Web Visualization
// ============================================================================

interface RadarChartData {
  [key: string]: string | number;
}

interface NovaRadarChartProps {
  data: RadarChartData[];
  keys: string[];
  indexBy: string;
  title?: string;
  subtitle?: string;
  palette?: keyof typeof NOVA_PALETTES;
  maxValue?: number;
}

export const NovaRadarChart = ({
  data,
  keys,
  indexBy,
  title,
  subtitle,
  palette = 'aurora',
  maxValue,
}: NovaRadarChartProps) => {
  const colors = NOVA_PALETTES[palette];

  return (
    <NovaChartWrapper title={title} subtitle={subtitle} height={400} glowColor={colors[0]}>
      <ResponsiveRadar
        data={data}
        keys={keys}
        indexBy={indexBy}
        maxValue={maxValue}
        margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
        curve="linearClosed"
        borderWidth={2}
        borderColor={{ from: 'color' }}
        gridLevels={5}
        gridShape="circular"
        gridLabelOffset={20}
        enableDots={true}
        dotSize={10}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        dotBorderColor={{ from: 'color' }}
        enableDotLabel={false}
        colors={colors}
        fillOpacity={0.25}
        blendMode="screen"
        animate={true}
        motionConfig="wobbly"
        theme={getNovaTheme()}
        legends={[
          {
            anchor: 'top-left',
            direction: 'column',
            translateX: -50,
            translateY: -40,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: '#9CA3AF',
            symbolSize: 12,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#FFFFFF',
                },
              },
            ],
          },
        ]}
      />
    </NovaChartWrapper>
  );
};

// ============================================================================
// PREMIUM STATS CARD - Animated Metric Display
// ============================================================================

interface NovaStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: string;
  glowIntensity?: 'low' | 'medium' | 'high';
}

export const NovaStatCard = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = '#8B5CF6',
  glowIntensity = 'medium',
}: NovaStatCardProps) => {
  const glowOpacity = { low: 0.1, medium: 0.2, high: 0.3 }[glowIntensity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="relative group cursor-pointer"
    >
      {/* Ambient glow */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')}, transparent 70%)`,
        }}
      />
      
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950/90 backdrop-blur-xl border border-gray-800/50 overflow-hidden">
        {/* Accent corner */}
        <div
          className="absolute top-0 right-0 w-24 h-24 opacity-20"
          style={{
            background: `radial-gradient(circle at top right, ${color}, transparent 70%)`,
          }}
        />
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              {title}
            </p>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mt-2 text-3xl font-bold text-white"
            >
              {value}
            </motion.h3>
            
            {(subtitle || trend) && (
              <div className="mt-2 flex items-center gap-2">
                {trend && (
                  <span
                    className={`inline-flex items-center text-sm font-medium ${
                      trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 11l5-5m0 0l5 5m-5-5v12"
                      />
                    </svg>
                    {Math.abs(trend.value)}%
                  </span>
                )}
                {subtitle && (
                  <span className="text-sm text-gray-500">{subtitle}</span>
                )}
              </div>
            )}
          </div>
          
          {icon && (
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{
                backgroundColor: `${color}20`,
                boxShadow: `0 0 20px ${color}30`,
              }}
            >
              <div style={{ color }}>{icon}</div>
            </div>
          )}
        </div>
        
        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />
      </div>
    </motion.div>
  );
};

// ============================================================================
// PREMIUM PROGRESS RING - Circular Progress Indicator
// ============================================================================

interface NovaProgressRingProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export const NovaProgressRing = ({
  value,
  maxValue = 100,
  size = 120,
  strokeWidth = 10,
  color = '#8B5CF6',
  label,
  sublabel,
}: NovaProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative inline-flex items-center justify-center"
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-30"
        style={{
          background: color,
        }}
      />
      
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="rgba(255, 255, 255, 0.1)"
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 10px ${color})`,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-white"
        >
          {Math.round(percentage)}%
        </motion.span>
        {label && (
          <span className="text-xs text-gray-400 mt-1">{label}</span>
        )}
      </div>
    </motion.div>
  );
};

export default {
  NovaPieChart,
  NovaBarChart,
  NovaLineChart,
  NovaRadialBarChart,
  NovaRadarChart,
  NovaStatCard,
  NovaProgressRing,
  NovaChartWrapper,
  NOVA_PALETTES,
};
