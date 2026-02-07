import { Flame, Trophy, Star, Zap } from 'lucide-react';
import { HabitWithStats } from '@/hooks/useEnhancedHabits';
import { cn } from '@/lib/utils';

interface StreakChainProps {
  habits: HabitWithStats[];
}

const MILESTONES = [
  { days: 5, icon: Star, label: '5 days', color: 'text-yellow-500' },
  { days: 21, icon: Zap, label: '21 days', color: 'text-blue-500' },
  { days: 66, icon: Trophy, label: '66 days', color: 'text-purple-500' },
];

export function StreakChain({ habits }: StreakChainProps) {
  const habitsWithStreaks = habits
    .filter(h => h.currentStreak > 0)
    .sort((a, b) => b.currentStreak - a.currentStreak);

  if (habitsWithStreaks.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Active Streaks</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No active streaks yet. Complete a habit today to start your chain!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-accent" />
        <h3 className="font-medium text-foreground">Active Streaks</h3>
      </div>

      <div className="space-y-3">
        {habitsWithStreaks.map(habit => {
          const milestone = MILESTONES.find(m => habit.currentStreak >= m.days);
          const MilestoneIcon = milestone?.icon;

          return (
            <div
              key={habit.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
            >
              {/* Chain visualization */}
              <div className="flex items-center">
                {Array.from({ length: Math.min(habit.currentStreak, 7) }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-3 h-3 rounded-full -ml-1 first:ml-0',
                      i === habit.currentStreak - 1 || i === 6
                        ? 'bg-accent'
                        : 'bg-accent/50'
                    )}
                    style={{
                      transform: `scale(${0.7 + (i / 10)})`,
                    }}
                  />
                ))}
                {habit.currentStreak > 7 && (
                  <span className="text-xs text-muted-foreground ml-1">+{habit.currentStreak - 7}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {habit.name}
                </p>
              </div>

              {/* Streak Count & Milestone */}
              <div className="flex items-center gap-2">
                {MilestoneIcon && (
                  <MilestoneIcon className={cn('w-4 h-4', milestone?.color)} />
                )}
                <span className="text-sm font-semibold text-accent">
                  {habit.currentStreak} 🔥
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestones Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Milestones</p>
        <div className="flex gap-4">
          {MILESTONES.map(({ days, icon: Icon, label, color }) => (
            <div key={days} className="flex items-center gap-1 text-xs">
              <Icon className={cn('w-3 h-3', color)} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
