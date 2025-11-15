import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { StoredSession } from '../services/storage';

type Props = { sessions: StoredSession[]; height?: number; minWidth?: number };

// Bar chart of sleep duration (hours). Early wakes highlighted. Left axis 1–10h.
const SleepBarChart: React.FC<Props> = ({ sessions, height = 260, minWidth = 360 }) => {
  if (!sessions || sessions.length === 0) return <View style={{ height }} />;
  const data = sessions.map(s => {
    const durMin = typeof s.durationMinutes === 'number' ? s.durationMinutes : undefined;
    const hours = durMin ? Math.max(0, Math.min(10, durMin / 60)) : 0;
    return { hours, early: s.early };
  });
  const barGap = 10;
  const barWidth = 16;
  const axisLeft = 36;
  const width = Math.max(minWidth, barGap + data.length * (barWidth + barGap));
  const chartBottom = height - 24;
  const chartTop = 8;
  const usableHeight = chartBottom - chartTop;
  const hrsToY = (hrs: number) => chartBottom - (hrs / 10) * usableHeight;

  return (
    <View style={{ paddingVertical: 4 }}>
      <Svg width={width + axisLeft} height={height}>
        {/* Left axis */}
        <Line x1={axisLeft} y1={chartTop} x2={axisLeft} y2={chartBottom} stroke="#888" strokeWidth={1} />
        {/* Grid + labels 1..10h */}
        {Array.from({ length: 10 }, (_, i) => i + 1).map(h => (
          <React.Fragment key={h}>
            <Line x1={axisLeft} y1={hrsToY(h)} x2={axisLeft + width} y2={hrsToY(h)} stroke="#333" strokeWidth={1} />
            <SvgText x={axisLeft - 6} y={hrsToY(h) + 3} fontSize={10} fill="#9aa0c0" textAnchor="end">{h}h</SvgText>
          </React.Fragment>
        ))}
        {/* Baseline */}
        <Line x1={axisLeft} y1={chartBottom} x2={axisLeft + width} y2={chartBottom} stroke="#888" strokeWidth={1} />
        {data.map((d, i) => {
          const x = axisLeft + barGap + i * (barWidth + barGap);
          const y = hrsToY(d.hours);
          const h = Math.max(2, chartBottom - y);
          const color = d.early ? '#e24a4a' : '#4a90e2';
          return <Rect key={i} x={x} y={y} width={barWidth} height={h} fill={color} rx={3} />;
        })}
      </Svg>
    </View>
  );
};

export default SleepBarChart;
