import { useMemo } from 'react';
import { TrendingUp, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HabitWithStats } from '@/hooks/useEnhancedHabits';
import { HabitLog } from '@/types/habits';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';

interface HabitStrengthChartProps {
  habit: HabitWithStats;
  logs: HabitLog[];
}

export function HabitStrengthChart({ habit, logs }: HabitStrengthChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 30);
    const days = eachDayOfInterval({ start: startDate, end: today });

    let cumulativeCompletions = 0;
    const habitLogs = logs.filter(l => l.habitId === habit.id && l.completed);
    
    // Count completions before the chart period
    habitLogs.forEach(log => {
      if (parseISO(log.date) < startDate) {
        cumulativeCompletions++;
      }
    });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const completed = habitLogs.some(l => l.date === dateStr);
      if (completed) cumulativeCompletions++;

      // Asymptotic growth curve: strength = maxStrength * (1 - e^(-k * repetitions))
      const maxStrength = 100;
      const growthRate = 0.05;
      const strength = maxStrength * (1 - Math.exp(-growthRate * cumulativeCompletions));

      return {
        date: format(day, 'MMM d'),
        strength: Math.round(strength * 10) / 10,
        completed,
        completions: cumulativeCompletions,
      };
    });
  }, [habit.id, logs]);

  const phaseThresholds = [
    { value: 20, label: 'Building', color: 'hsl(var(--muted-foreground))' },
    { value: 50, label: 'Growing', color: 'hsl(var(--warning))' },
    { value: 80, label: 'Established', color: 'hsl(var(--primary))' },
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">Habit Strength</h3>
        </div>
        <UITooltip>
          <TooltipTrigger>
            <Info className="w-4 h-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>
              Early repetitions provide rapid gains that eventually level off into a &ldquo;plateau&rdquo; of habit strength.
              This reflects how habits become automatic over time.
            </p>
          </TooltipContent>
        </UITooltip>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${habit.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            
            {/* Phase threshold lines */}
            {phaseThresholds.map(({ value, label }) => (
              <ReferenceLine 
                key={value}
                y={value} 
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
            ))}
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value}%`, 'Strength']}
              labelFormatter={(label) => label}
            />
            
            <Area
              type="monotone"
              dataKey="strength"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill={`url(#gradient-${habit.id})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Phase Legend */}
      <div className="flex justify-between mt-4 pt-3 border-t border-border">
        <div className="text-xs">
          <span className="text-muted-foreground">0-20%:</span>
          <span className="ml-1">Building</span>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">20-50%:</span>
          <span className="ml-1 text-warning">Growing</span>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">50-80%:</span>
          <span className="ml-1 text-primary">Established</span>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">80%+:</span>
          <span className="ml-1 text-success">Automatic</span>
        </div>
      </div>
    </div>
  );
}
