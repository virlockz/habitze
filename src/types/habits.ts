// Enhanced Habit Types with Habit Stacking, 2-Minute Rule, Categories, and Flexible Scheduling

export type HabitCategory = 
  | 'morning'
  | 'health'
  | 'academics'
  | 'evening'
  | 'productivity'
  | 'wellness'
  | 'custom';

export type ScheduleType = 'daily' | 'weekly' | 'monthly';

export interface HabitSchedule {
  type: ScheduleType;
  targetDays?: number[]; // For weekly: 0-6 (Sun-Sat)
  targetCount?: number;  // For monthly: X times per month
}

export interface Habit {
  id: string;
  name: string;
  
  // Habit Stacking: "After [Current Habit], I will [New Habit]"
  stackingCue?: string;         // The current habit/trigger
  stackingAction?: string;      // What to do after the trigger
  
  // 2-Minute Rule
  twoMinuteAction?: string;     // Entry-level 2-minute version
  
  // Context-Specific Tracking
  contextCue?: string;          // e.g., "In the kitchen after breakfast"
  
  // Categorization
  category: HabitCategory;
  customCategoryName?: string;  // For custom categories
  
  // Scheduling
  schedule: HabitSchedule;
  
  // Metadata
  createdAt: string;
  color?: string;               // Optional color override
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
}

export interface AutomaticityRating {
  id: string;
  habitId: string;
  weekStart: string; // YYYY-MM-DD of week start (Monday)
  rating: number;    // 1-5 scale
  notes?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  wins: string[];      // Small wins to celebrate
  misses: string[];    // Why habits were missed
  createdAt: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

// Category metadata
export const PRESET_CATEGORIES: Record<Exclude<HabitCategory, 'custom'>, { name: string; icon: string; color: string }> = {
  morning: { name: 'Morning Routine', icon: 'Sunrise', color: 'hsl(38 92% 50%)' },
  health: { name: 'Health & Fitness', icon: 'Heart', color: 'hsl(0 72% 51%)' },
  academics: { name: 'Academics & Learning', icon: 'BookOpen', color: 'hsl(217 91% 60%)' },
  evening: { name: 'Evening Routine', icon: 'Moon', color: 'hsl(262 83% 58%)' },
  productivity: { name: 'Productivity', icon: 'Zap', color: 'hsl(45 93% 47%)' },
  wellness: { name: 'Wellness & Self-Care', icon: 'Sparkles', color: 'hsl(152 69% 45%)' },
};

// Calculate streak for a habit
export function calculateStreak(habitId: string, logs: HabitLog[]): number {
  const habitLogs = logs
    .filter(l => l.habitId === habitId && l.completed)
    .map(l => l.date)
    .sort()
    .reverse();

  if (habitLogs.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (habitLogs.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      // Today not completed yet, check from yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Calculate habit strength (asymptotic curve: rapid early gains, plateaus later)
export function calculateHabitStrength(
  completions: number,
  daysSinceCreated: number
): { strength: number; phase: 'building' | 'growing' | 'established' | 'automatic' } {
  // Asymptotic growth: strength = maxStrength * (1 - e^(-k * repetitions))
  // This creates rapid initial gains that level off
  const maxStrength = 100;
  const growthRate = 0.05; // How fast habits approach max strength
  
  const strength = maxStrength * (1 - Math.exp(-growthRate * completions));
  
  // Determine phase based on strength
  let phase: 'building' | 'growing' | 'established' | 'automatic';
  if (strength < 20) {
    phase = 'building';
  } else if (strength < 50) {
    phase = 'growing';
  } else if (strength < 80) {
    phase = 'established';
  } else {
    phase = 'automatic';
  }
  
  return { strength: Math.round(strength), phase };
}

// Check if today is a scheduled day for the habit
export function isScheduledDay(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay();
  
  switch (habit.schedule.type) {
    case 'daily':
      return true;
    case 'weekly':
      return habit.schedule.targetDays?.includes(dayOfWeek) ?? false;
    case 'monthly':
      // For monthly, any day counts toward the monthly target
      return true;
    default:
      return true;
  }
}
