import { Link2, Clock, MapPin, Flame, TrendingUp, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HabitWithStats } from '@/hooks/useEnhancedHabits';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: HabitWithStats;
  onEdit: () => void;
  onDelete: () => void;
  onToggleToday: () => void;
  isTodayCompleted: boolean;
}

const phaseColors = {
  building: 'text-muted-foreground',
  growing: 'text-warning',
  established: 'text-primary',
  automatic: 'text-success',
};

const phaseLabels = {
  building: 'Building',
  growing: 'Growing',
  established: 'Established',
  automatic: 'Automatic',
};

export function HabitCard({
  habit,
  onEdit,
  onDelete,
  onToggleToday,
  isTodayCompleted,
}: HabitCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{habit.name}</h3>
          {habit.contextCue && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {habit.contextCue}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Today's checkbox */}
          <button
            onClick={onToggleToday}
            className={cn(
              'w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all',
              isTodayCompleted
                ? 'bg-success border-success text-success-foreground'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
            )}
          >
            {isTodayCompleted && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Habit Stacking */}
      {habit.stackingCue && habit.stackingAction && (
        <div className="text-xs p-2 rounded-md bg-secondary/50 mb-3">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Link2 className="w-3 h-3" />
            <span>Habit Stack</span>
          </div>
          <p className="text-foreground">
            After <span className="font-medium">{habit.stackingCue}</span>, I will{' '}
            <span className="font-medium">{habit.stackingAction}</span>
          </p>
        </div>
      )}

      {/* 2-Minute Action */}
      {habit.twoMinuteAction && (
        <div className="text-xs p-2 rounded-md bg-primary/5 mb-3">
          <div className="flex items-center gap-1 text-primary mb-1">
            <Clock className="w-3 h-3" />
            <span>2-Min Start</span>
          </div>
          <p className="text-foreground">{habit.twoMinuteAction}</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-sm">
        {/* Streak */}
        <div className="flex items-center gap-1">
          <Flame className={cn('w-4 h-4', habit.currentStreak > 0 ? 'text-accent' : 'text-muted-foreground')} />
          <span className={cn(habit.currentStreak > 0 ? 'text-accent font-medium' : 'text-muted-foreground')}>
            {habit.currentStreak}
          </span>
        </div>

        {/* Habit Strength */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={phaseColors[habit.phase]}>{phaseLabels[habit.phase]}</span>
            <span className="text-muted-foreground">{habit.strength}%</span>
          </div>
          <Progress value={habit.strength} className="h-1.5" />
        </div>
      </div>
    </div>
  );
}
