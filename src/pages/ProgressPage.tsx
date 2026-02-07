import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEnhancedHabits } from '@/hooks/useEnhancedHabits';
import { HabitStrengthChart } from '@/components/habits/HabitStrengthChart';
import { PRESET_CATEGORIES, HabitCategory } from '@/types/habits';

export default function ProgressPage() {
  const { habitsWithStats, logs, isLoaded } = useEnhancedHabits();
  const [categoryFilter, setCategoryFilter] = useState<HabitCategory | 'all'>('all');

  const filteredHabits = useMemo(() => {
    if (categoryFilter === 'all') return habitsWithStats;
    return habitsWithStats.filter(h => h.category === categoryFilter);
  }, [habitsWithStats, categoryFilter]);

  // Overall stats
  const stats = useMemo(() => {
    const totalStrength = habitsWithStats.reduce((sum, h) => sum + h.strength, 0);
    const avgStrength = habitsWithStats.length > 0 
      ? Math.round(totalStrength / habitsWithStats.length)
      : 0;

    const automaticHabits = habitsWithStats.filter(h => h.phase === 'automatic').length;
    const longestStreak = Math.max(0, ...habitsWithStats.map(h => h.currentStreak));

    return { avgStrength, automaticHabits, longestStreak };
  }, [habitsWithStats]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
            Progress & Insights
          </h1>
          <p className="text-sm text-muted-foreground">
            Non-linear growth visualization
          </p>
        </div>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as HabitCategory | 'all')}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(PRESET_CATEGORIES).map(([key, { name }]) => (
              <SelectItem key={key} value={key}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overall Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Average Strength</p>
          <p className="text-3xl font-display font-semibold text-foreground">
            {stats.avgStrength}%
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Automatic Habits</p>
          <p className="text-3xl font-display font-semibold text-success">
            {stats.automaticHabits}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Longest Active Streak</p>
          <p className="text-3xl font-display font-semibold text-accent">
            {stats.longestStreak} 🔥
          </p>
        </div>
      </div>

      {/* Habit Strength Charts */}
      {filteredHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No habits to visualize</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            {categoryFilter === 'all' 
              ? 'Add some habits first to see your progress charts.'
              : 'No habits in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredHabits.map(habit => (
            <HabitStrengthChart
              key={habit.id}
              habit={habit}
              logs={logs}
            />
          ))}
        </div>
      )}

      {/* Explanation Card */}
      <div className="mt-8 p-6 rounded-xl bg-secondary/50 border border-border">
        <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Understanding the Asymptotic Curve
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The chart shows how habits grow stronger over time following an{' '}
          <strong className="text-foreground">asymptotic pattern</strong>—early repetitions provide rapid gains 
          that eventually level off into a &ldquo;plateau&rdquo; of habit strength. This reflects the science 
          behind habit formation: initial effort yields big improvements, while later repetitions maintain 
          and solidify the behavior until it becomes truly automatic.
        </p>
      </div>
    </div>
  );
}
