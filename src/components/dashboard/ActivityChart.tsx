import { useMemo } from 'react';
import { format, subHours, isAfter } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { FileEvent, DetectionResult } from '@/lib/types';

interface ActivityChartProps {
  fileEvents: FileEvent[];
  detectionResults: DetectionResult[];
}

export function ActivityChart({ fileEvents, detectionResults }: ActivityChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const hoursAgo = subHours(now, 24);
    
    // Group events by hour
    const hourlyData: Record<string, { events: number; detections: number; ransomware: number }> = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      const hour = subHours(now, 23 - i);
      const key = format(hour, 'HH:00');
      hourlyData[key] = { events: 0, detections: 0, ransomware: 0 };
    }

    // Count file events
    fileEvents.forEach(event => {
      const eventTime = new Date(event.created_at);
      if (isAfter(eventTime, hoursAgo)) {
        const key = format(eventTime, 'HH:00');
        if (hourlyData[key]) {
          hourlyData[key].events++;
        }
      }
    });

    // Count detections
    detectionResults.forEach(result => {
      const resultTime = new Date(result.created_at);
      if (isAfter(resultTime, hoursAgo)) {
        const key = format(resultTime, 'HH:00');
        if (hourlyData[key]) {
          hourlyData[key].detections++;
          if (result.status === 'ransomware') {
            hourlyData[key].ransomware++;
          }
        }
      }
    });

    return Object.entries(hourlyData).map(([time, data]) => ({
      time,
      ...data,
    }));
  }, [fileEvents, detectionResults]);

  return (
    <div className="cyber-card cyber-border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Activity Timeline (24h)</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary/50" />
            <span className="text-muted-foreground">Events</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warning/50" />
            <span className="text-muted-foreground">Detections</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive/50" />
            <span className="text-muted-foreground">Ransomware</span>
          </div>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 100%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 100%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 95%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 95%, 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRansomware" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(180, 30%, 20%)" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(180, 20%, 55%)" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(180, 20%, 55%)" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 8%)',
                border: '1px solid hsl(180, 30%, 20%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(180, 100%, 90%)' }}
            />
            <Area
              type="monotone"
              dataKey="events"
              stroke="hsl(160, 100%, 45%)"
              fillOpacity={1}
              fill="url(#colorEvents)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="detections"
              stroke="hsl(38, 95%, 55%)"
              fillOpacity={1}
              fill="url(#colorDetections)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="ransomware"
              stroke="hsl(0, 85%, 55%)"
              fillOpacity={1}
              fill="url(#colorRansomware)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
