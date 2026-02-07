import { useState } from 'react';
import { ChevronDown, ChevronRight, Sunrise, Heart, BookOpen, Moon, Zap, Sparkles } from 'lucide-react';
import { HabitCard } from './HabitCard';
import { HabitWithStats } from '@/hooks/useEnhancedHabits';
import { HabitCategory, PRESET_CATEGORIES, CustomCategory } from '@/types/habits';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  morning: Sunrise,
  health: Heart,
  academics: BookOpen,
  evening: Moon,
  productivity: Zap,
  wellness: Sparkles,
};

interface CategorySectionProps {
  category: HabitCategory;
  customCategory?: CustomCategory;
  habits: HabitWithStats[];
  onEditHabit: (habit: HabitWithStats) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleToday: (habitId: string) => void;
  isCompleted: (habitId: string) => boolean;
}

export function CategorySection({
  category,
  customCategory,
  habits,
  onEditHabit,
  onDeleteHabit,
  onToggleToday,
  isCompleted,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const categoryInfo = category === 'custom' && customCategory
    ? { name: customCategory.name, icon: 'Sparkles', color: customCategory.color }
    : PRESET_CATEGORIES[category as keyof typeof PRESET_CATEGORIES];

  if (!categoryInfo || habits.length === 0) return null;

  const Icon = categoryIcons[category] || Sparkles;
  const completedCount = habits.filter(h => isCompleted(h.id)).length;

  return (
    <div className="mb-6">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${categoryInfo.color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: categoryInfo.color }} />
        </div>
        
        <div className="flex-1 text-left">
          <h2 className="font-medium text-foreground">{categoryInfo.name}</h2>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{habits.length} completed today
          </p>
        </div>

        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Habits Grid */}
      {isExpanded && (
        <div className="grid gap-3 mt-3 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={() => onEditHabit(habit)}
              onDelete={() => onDeleteHabit(habit.id)}
              onToggleToday={() => onToggleToday(habit.id)}
              isTodayCompleted={isCompleted(habit.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
