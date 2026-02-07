import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getWeek, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HabitCell } from './HabitCell';
import { useEnhancedHabits } from '@/hooks/useEnhancedHabits';
import { cn } from '@/lib/utils';

export function MonthlyGrid() {
  const { habitsWithStats, isCompleted, toggleLog, isLoaded } = useEnhancedHabits();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Group days by week
  const weeks = useMemo(() => {
    const grouped: { weekNum: number; days: Date[] }[] = [];
    let currentWeek: Date[] = [];
    let currentWeekNum = getWeek(days[0]);

    days.forEach((day, index) => {
      const weekNum = getWeek(day);
      if (weekNum !== currentWeekNum) {
        grouped.push({ weekNum: currentWeekNum, days: currentWeek });
        currentWeek = [day];
        currentWeekNum = weekNum;
      } else {
        currentWeek.push(day);
      }

      if (index === days.length - 1) {
        grouped.push({ weekNum: currentWeekNum, days: currentWeek });
      }
    });

    return grouped;
  }, [days]);

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (habitsWithStats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No habits yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Go to Dashboard or Settings to add your first habit and start tracking!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground min-w-[200px] text-center">
            {format(currentMonth, 'MMMM yyyy').toUpperCase()}
          </h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Grid Container - Scrollable */}
      <div className="overflow-x-auto flex-1 pb-4">
        <div className="min-w-max">
          {/* Week Headers */}
          <div className="flex mb-2">
            <div className="w-32 md:w-40 shrink-0" /> {/* Habit name column spacer */}
            {weeks.map((week, i) => (
              <div
                key={week.weekNum}
                className="flex-shrink-0 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide"
                style={{ width: `${week.days.length * 36}px` }}
              >
                Week {i + 1}
              </div>
            ))}
          </div>

          {/* Day Numbers Row */}
          <div className="flex mb-3 sticky top-0 bg-background z-10 py-1">
            <div className="w-32 md:w-40 shrink-0" /> {/* Habit name column spacer */}
            {days.map((day) => {
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'w-9 text-center text-xs font-medium shrink-0',
                    isToday ? 'text-primary font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>

          {/* Habit Rows */}
          {habitsWithStats.map((habit) => (
            <div key={habit.id} className="flex items-center mb-2 group">
              {/* Habit Name */}
              <div className="w-32 md:w-40 shrink-0 pr-3">
                <span className="text-sm font-medium text-foreground truncate block">
                  {habit.name}
                </span>
              </div>

              {/* Day Cells */}
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isToday = isSameDay(day, today);
                const completed = isCompleted(habit.id, dateStr);

                return (
                  <div key={dateStr} className="w-9 flex justify-center shrink-0">
                    <HabitCell
                      completed={completed}
                      isToday={isToday}
                      onClick={() => toggleLog(habit.id, dateStr)}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
