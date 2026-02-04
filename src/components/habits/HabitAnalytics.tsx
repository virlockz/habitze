import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useHabits, useHabitLogs } from '@/hooks/useHabits';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';

interface HabitAnalyticsProps {
  currentMonth: Date;
}

export default function HabitAnalytics({ currentMonth }: HabitAnalyticsProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const { habits } = useHabits();
  const { logs } = useHabitLogs(monthStart, monthEnd);

  const analytics = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const today = new Date();
    const relevantDays = days.filter(day => day <= today);
    
    // Calculate expected and completed
    let totalExpected = 0;
    let totalCompleted = 0;

    habits.forEach(habit => {
      if (habit.frequency === 'daily') {
        totalExpected += relevantDays.length;
      } else {
        // Weekly: count weeks in month
        const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });
        totalExpected += weeks.length;
      }
      
      const habitLogs = logs.filter(log => log.habit_id === habit.id && log.completed);
      totalCompleted += habitLogs.length;
    });

    const completionRate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

    // Pie chart data
    const pieData = [
      { name: 'Completed', value: totalCompleted, color: 'hsl(152, 69%, 45%)' },
      { name: 'Missed', value: Math.max(0, totalExpected - totalCompleted), color: 'hsl(210, 15%, 85%)' },
    ];

    // Weekly progress data
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });
    const weeklyData = weeks.map((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart);
      const weekDays = eachDayOfInterval({ 
        start: weekStart < monthStart ? monthStart : weekStart,
        end: weekEnd > monthEnd ? monthEnd : weekEnd
      }).filter(day => day <= today);

      let weekCompleted = 0;
      let weekExpected = 0;

      habits.forEach(habit => {
        if (habit.frequency === 'daily') {
          weekExpected += weekDays.length;
          const habitLogs = logs.filter(log => {
            const logDate = new Date(log.date);
            return log.habit_id === habit.id && 
                   log.completed && 
                   isWithinInterval(logDate, { start: weekStart, end: weekEnd });
          });
          weekCompleted += habitLogs.length;
        } else {
          weekExpected += 1;
          const habitLogs = logs.filter(log => {
            const logDate = new Date(log.date);
            return log.habit_id === habit.id && 
                   log.completed && 
                   isWithinInterval(logDate, { start: weekStart, end: weekEnd });
          });
          if (habitLogs.length > 0) weekCompleted += 1;
        }
      });

      return {
        name: `Week ${index + 1}`,
        completed: weekCompleted,
        expected: weekExpected,
        rate: weekExpected > 0 ? Math.round((weekCompleted / weekExpected) * 100) : 0,
      };
    });

    // Best streak calculation
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    relevantDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayLogs = logs.filter(log => log.date === dateStr && log.completed);
      const allHabitsComplete = habits.length > 0 && dayLogs.length === habits.length;

      if (allHabitsComplete) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    // Check if streak continues to today
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayLogs = logs.filter(log => log.date === todayStr && log.completed);
    if (habits.length > 0 && todayLogs.length === habits.length) {
      currentStreak = tempStreak;
    }

    return {
      completionRate,
      totalCompleted,
      totalExpected,
      pieData,
      weeklyData,
      currentStreak,
      bestStreak,
    };
  }, [habits, logs, monthStart, monthEnd]);

  if (habits.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6 text-center">
        <div className="py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No analytics yet</h3>
          <p className="text-muted-foreground text-sm">
            Create some habits to see your progress analytics!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Completion</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.completionRate}%</p>
        </div>
        
        <div className="bg-card rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.totalCompleted}</p>
        </div>
        
        <div className="bg-card rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Current Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.currentStreak}</p>
        </div>
        
        <div className="bg-card rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Best Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.bestStreak}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-card rounded-2xl shadow-card p-4 md:p-6">
          <h3 className="font-display text-lg text-foreground mb-4">
            {format(currentMonth, 'MMMM')} Overview
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {analytics.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {analytics.pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-muted-foreground">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-card rounded-2xl shadow-card p-4 md:p-6">
          <h3 className="font-display text-lg text-foreground mb-4">Weekly Progress</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 90%)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: 'hsl(220, 10%, 45%)' }}
                  axisLine={{ stroke: 'hsl(210, 15%, 90%)' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(220, 10%, 45%)' }}
                  axisLine={{ stroke: 'hsl(210, 15%, 90%)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(210, 15%, 90%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    value, 
                    name === 'completed' ? 'Completed' : 'Expected'
                  ]}
                />
                <Bar dataKey="completed" fill="hsl(175, 84%, 32%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
