import { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHabits, useHabitLogs, Habit } from '@/hooks/useHabits';
import { cn } from '@/lib/utils';

interface HabitCalendarProps {
  onMonthChange?: (date: Date) => void;
}

export default function HabitCalendar({ onMonthChange }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const { habits } = useHabits();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const { logs, toggleHabitLog } = useHabitLogs(monthStart, monthEnd);
  
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    onMonthChange?.(currentDate);
  }, [currentDate, onMonthChange]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSlideDirection(direction === 'next' ? 'left' : 'right');
    setTimeout(() => {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
      setSlideDirection(null);
    }, 150);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        navigateMonth('next');
      } else {
        navigateMonth('prev');
      }
    }
  };

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getHabitLogsForDay = (day: Date, habitId: string) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return logs.find(log => log.habit_id === habitId && log.date === dateStr);
  };

  const handleDayClick = (day: Date, habit: Habit) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    toggleHabitLog.mutate({ habitId: habit.id, date: dateStr });
  };

  const getCompletedHabitsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return logs.filter(log => log.date === dateStr && log.completed);
  };

  return (
    <div 
      className="bg-card rounded-2xl shadow-card p-4 md:p-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-display text-xl md:text-2xl text-foreground">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className={cn(
        "transition-all duration-150",
        slideDirection === 'left' && "opacity-0 translate-x-4",
        slideDirection === 'right' && "opacity-0 -translate-x-4"
      )}>
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Actual days */}
          {days.map(day => {
            const completedHabits = getCompletedHabitsForDay(day);
            const hasCompleted = completedHabits.length > 0;
            const allCompleted = habits.length > 0 && completedHabits.length === habits.length;
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all duration-200 cursor-pointer hover:bg-secondary",
                  isToday(day) && "ring-2 ring-primary ring-offset-2",
                  allCompleted && "bg-success/20",
                  hasCompleted && !allCompleted && "bg-primary/10"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isToday(day) ? "text-primary" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </span>
                
                {/* Habit dots */}
                {habits.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-full">
                    {habits.slice(0, 4).map(habit => {
                      const log = getHabitLogsForDay(day, habit.id);
                      return (
                        <button
                          key={habit.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDayClick(day, habit);
                          }}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all duration-200",
                            log?.completed 
                              ? "habit-complete" 
                              : "opacity-30 hover:opacity-60"
                          )}
                          style={{ backgroundColor: habit.color }}
                          title={habit.name}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Habits Legend */}
      {habits.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-3">
            {habits.map(habit => (
              <div key={habit.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="text-sm text-muted-foreground">{habit.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
