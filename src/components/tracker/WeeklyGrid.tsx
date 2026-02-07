import { useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, getWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HabitCell } from './HabitCell';
import { useEnhancedHabits } from '@/hooks/useEnhancedHabits';
import { cn } from '@/lib/utils';

export function WeeklyGrid() {
  const { habitsWithStats, isCompleted, toggleLog, isLoaded } = useEnhancedHabits();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const today = new Date();

  const days = useMemo(() => {
    const start = currentWeekStart;
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentWeekStart]);

  const weekNumber = getWeek(currentWeekStart);
  const dateRange = `${format(days[0], 'MMM d')} - ${format(days[6], 'MMM d, yyyy')}`;

  const goToPrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToThisWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground">
            WEEK {weekNumber}
          </h2>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPrevWeek}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToThisWeek}>
            This Week
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1">
        {/* Day Headers */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="col-span-1" /> {/* Habit name spacer */}
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'text-center py-2 rounded-lg',
                  isToday && 'bg-primary/10'
                )}
              >
                <div className={cn(
                  'text-xs font-medium uppercase',
                  isToday ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {format(day, 'EEE')}
                </div>
                <div className={cn(
                  'text-lg font-semibold',
                  isToday ? 'text-primary' : 'text-foreground'
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Habit Rows */}
        {habitsWithStats.map((habit) => (
          <div key={habit.id} className="grid grid-cols-8 gap-2 mb-3 items-center">
            {/* Habit Name */}
            <div className="col-span-1 pr-2">
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
                <div 
                  key={dateStr} 
                  className={cn(
                    'flex justify-center p-1 rounded-lg',
                    isToday && 'bg-primary/5'
                  )}
                >
                  <HabitCell
                    completed={completed}
                    isToday={isToday}
                    onClick={() => toggleLog(habit.id, dateStr)}
                    size="lg"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
