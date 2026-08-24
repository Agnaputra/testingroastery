'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface FlavorMetrics {
  acidity: number; // 0 - 10
  sweetness: number; // 0 - 10
  body: number; // 0 - 10
  floral: number; // 0 - 10
  aftertaste: number; // 0 - 10
  balance: number; // 0 - 10
}

interface FlavorRadarChartProps {
  metrics: FlavorMetrics;
  size?: number;
  className?: string;
  showLabels?: boolean;
  showBars?: boolean;
  color?: 'maroon' | 'navy' | 'teal' | 'amber';
  title?: string;
}

const AXES: { key: keyof FlavorMetrics; label: string; short: string }[] = [
  { key: 'acidity', label: 'Acidity (Keasaman)', short: 'Acidity' },
  { key: 'sweetness', label: 'Sweetness (Kemanisan)', short: 'Sweetness' },
  { key: 'body', label: 'Body (Ketebalan)', short: 'Body' },
  { key: 'floral', label: 'Floral & Aroma', short: 'Floral' },
  { key: 'aftertaste', label: 'Aftertaste', short: 'Aftertaste' },
  { key: 'balance', label: 'Balance & Clean Cup', short: 'Balance' },
];

export function FlavorRadarChart({
  metrics,
  size = 280,
  className = '',
  showLabels = true,
  showBars = true,
  color = 'maroon',
  title,
}: FlavorRadarChartProps) {
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = AXES.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Palette configurations
  const colorMap = {
    maroon: {
      fill: 'rgba(139, 30, 45, 0.22)',
      stroke: '#8B1E2D',
      dot: '#8B1E2D',
      badge: 'bg-brand-maroon/10 text-brand-maroon border-brand-maroon/20',
      bar: 'bg-brand-maroon',
    },
    navy: {
      fill: 'rgba(34, 60, 94, 0.22)',
      stroke: '#223C5E',
      dot: '#223C5E',
      badge: 'bg-brand-navy/10 text-brand-navy border-brand-navy/20',
      bar: 'bg-brand-navy',
    },
    teal: {
      fill: 'rgba(38, 152, 171, 0.22)',
      stroke: '#2698AB',
      dot: '#2698AB',
      badge: 'bg-brand-teal/15 text-brand-teal border-brand-teal/30',
      bar: 'bg-brand-teal',
    },
    amber: {
      fill: 'rgba(217, 119, 6, 0.22)',
      stroke: '#D97706',
      dot: '#D97706',
      badge: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
      bar: 'bg-amber-500',
    },
  };

  const activeColor = colorMap[color] || colorMap.maroon;

  // Calculate polygon coordinates for a given set of normalized values (0 - 1)
  const getCoordinates = (values: number[]) => {
    return values.map((val, i) => {
      const angle = i * angleStep - Math.PI / 2; // start from top
      const r = val * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y };
    });
  };

  // Convert metric values (0-10) to normalized values (0-1)
  const normalizedValues = useMemo(() => {
    return AXES.map((axis) => Math.min(10, Math.max(0, metrics[axis.key] || 0)) / 10);
  }, [metrics]);

  const polygonPoints = useMemo(() => {
    const coords = getCoordinates(normalizedValues);
    return coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  }, [normalizedValues, center, radius, angleStep]);

  const activeCoords = useMemo(() => {
    return getCoordinates(normalizedValues);
  }, [normalizedValues, center, radius, angleStep]);

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="font-editorial text-sm sm:text-base font-bold text-brand-navy">
            {title}
          </h4>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${activeColor.badge}`}>
            SCA Cupping Profile
          </span>
        </div>
      )}

      {/* Radar SVG Container */}
      <div className="relative flex items-center justify-center p-2 bg-surface-container-low/50 rounded-2xl border border-border-subtle overflow-hidden">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none drop-shadow-sm"
        >
          {/* Concentric Web Grid Polygons */}
          {levels.map((lvl, lvlIdx) => {
            const gridCoords = getCoordinates(new Array(numAxes).fill(lvl));
            const gridPoints = gridCoords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
            return (
              <polygon
                key={`grid-${lvlIdx}`}
                points={gridPoints}
                fill={lvlIdx === levels.length - 1 ? '#FFFFFF' : 'none'}
                stroke="#E2E8F0"
                strokeWidth={lvlIdx === levels.length - 1 ? '1.5' : '1'}
                strokeDasharray={lvlIdx < levels.length - 1 ? '3 3' : undefined}
              />
            );
          })}

          {/* Radial Axis Lines */}
          {AXES.map((axis, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={`axis-${axis.key}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Dynamic Animated Data Polygon */}
          <motion.polygon
            points={polygonPoints}
            fill={activeColor.fill}
            stroke={activeColor.stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* Vertex Dots & Pulse Glow */}
          {activeCoords.map((coord, i) => (
            <g key={`dot-${AXES[i].key}`}>
              <circle
                cx={coord.x}
                cy={coord.y}
                r="4.5"
                fill="#FFFFFF"
                stroke={activeColor.dot}
                strokeWidth="2.5"
                className="transition-all duration-300"
              />
              <circle
                cx={coord.x}
                cy={coord.y}
                r="7"
                fill={activeColor.dot}
                opacity="0.2"
              />
            </g>
          ))}

          {/* Outer Axis Labels */}
          {showLabels &&
            AXES.map((axis, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const labelRadius = radius + 22;
              const x = center + labelRadius * Math.cos(angle);
              const y = center + labelRadius * Math.sin(angle);

              // Text anchor calculation based on angle
              let textAnchor: 'middle' | 'start' | 'end' = 'middle';
              if (Math.cos(angle) > 0.3) textAnchor = 'start';
              else if (Math.cos(angle) < -0.3) textAnchor = 'end';

              const val = metrics[axis.key]?.toFixed(1) || '0.0';

              return (
                <text
                  key={`label-${axis.key}`}
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  className="font-mono text-[10px] fill-on-surface font-semibold tracking-tight"
                >
                  {axis.short} <tspan className="fill-brand-maroon font-bold">({val})</tspan>
                </text>
              );
            })}
        </svg>
      </div>

      {/* Linear Sensory Breakdown Bars */}
      {showBars && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1 text-xs">
          {AXES.map((axis) => {
            const rawVal = metrics[axis.key] || 0;
            const percent = Math.min(100, Math.max(0, (rawVal / 10) * 100));
            return (
              <div key={`bar-${axis.key}`} className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-on-surface-variant font-medium truncate">{axis.short}</span>
                  <span className="font-bold text-brand-navy">{rawVal.toFixed(1)}/10</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${activeColor.bar} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
