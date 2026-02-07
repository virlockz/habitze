import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Habit,
  HabitLog,
  AutomaticityRating,
  JournalEntry,
  CustomCategory,
  HabitCategory,
  HabitSchedule,
  calculateStreak,
  calculateHabitStrength,
} from '@/types/habits';
import { format, startOfWeek, differenceInDays, parseISO } from 'date-fns';

const HABITS_KEY = 'enhanced-habits';
const LOGS_KEY = 'enhanced-habits-logs';
const RATINGS_KEY = 'enhanced-habits-ratings';
const JOURNALS_KEY = 'enhanced-habits-journals';
const CATEGORIES_KEY = 'enhanced-habits-categories';

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  strength: number;
  phase: 'building' | 'growing' | 'established' | 'automatic';
  completionsThisMonth: number;
  totalCompletions: number;
}

export function useEnhancedHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [ratings, setRatings] = useState<AutomaticityRating[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem(HABITS_KEY);
    const savedLogs = localStorage.getItem(LOGS_KEY);
    const savedRatings = localStorage.getItem(RATINGS_KEY);
    const savedJournals = localStorage.getItem(JOURNALS_KEY);
    const savedCategories = localStorage.getItem(CATEGORIES_KEY);

    try {
      if (savedHabits) setHabits(JSON.parse(savedHabits));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedRatings) setRatings(JSON.parse(savedRatings));
      if (savedJournals) setJournals(JSON.parse(savedJournals));
      if (savedCategories) setCustomCategories(JSON.parse(savedCategories));
    } catch (e) {
      console.error('Failed to parse data from localStorage', e);
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    }
  }, [habits, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    }
  }, [logs, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
    }
  }, [ratings, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
    }
  }, [journals, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCategories));
    }
  }, [customCategories, isLoaded]);

  // HABIT CRUD
  const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, ...updates } : h))
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setLogs(prev => prev.filter(l => l.habitId !== id));
    setRatings(prev => prev.filter(r => r.habitId !== id));
  }, []);

  // LOGGING
  const toggleLog = useCallback((habitId: string, date: string) => {
    setLogs(prev => {
      const existingLog = prev.find(l => l.habitId === habitId && l.date === date);

      if (existingLog) {
        if (existingLog.completed) {
          return prev.filter(l => !(l.habitId === habitId && l.date === date));
        } else {
          return prev.map(l =>
            l.habitId === habitId && l.date === date ? { ...l, completed: true } : l
          );
        }
      } else {
        return [...prev, { habitId, date, completed: true }];
      }
    });
  }, []);

  const isCompleted = useCallback(
    (habitId: string, date: string) => {
      return logs.some(l => l.habitId === habitId && l.date === date && l.completed);
    },
    [logs]
  );

  // AUTOMATICITY RATINGS
  const addRating = useCallback(
    (habitId: string, rating: number, notes?: string) => {
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

      // Check if rating already exists for this week
      const existing = ratings.find(
        r => r.habitId === habitId && r.weekStart === weekStart
      );

      if (existing) {
        setRatings(prev =>
          prev.map(r =>
            r.id === existing.id ? { ...r, rating, notes } : r
          )
        );
      } else {
        const newRating: AutomaticityRating = {
          id: crypto.randomUUID(),
          habitId,
          weekStart,
          rating,
          notes,
          createdAt: new Date().toISOString(),
        };
        setRatings(prev => [...prev, newRating]);
      }
    },
    [ratings]
  );

  const getWeeklyRating = useCallback(
    (habitId: string, weekStart?: string) => {
      const targetWeek =
        weekStart || format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      return ratings.find(r => r.habitId === habitId && r.weekStart === targetWeek);
    },
    [ratings]
  );

  // JOURNALING
  const saveJournalEntry = useCallback((date: string, content: string, wins: string[], misses: string[]) => {
    const existing = journals.find(j => j.date === date);

    if (existing) {
      setJournals(prev =>
        prev.map(j =>
          j.date === date ? { ...j, content, wins, misses } : j
        )
      );
    } else {
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        date,
        content,
        wins,
        misses,
        createdAt: new Date().toISOString(),
      };
      setJournals(prev => [...prev, newEntry]);
    }
  }, [journals]);

  const getJournalEntry = useCallback(
    (date: string) => {
      return journals.find(j => j.date === date);
    },
    [journals]
  );

  // CUSTOM CATEGORIES
  const addCustomCategory = useCallback((name: string, color: string, icon?: string) => {
    const newCategory: CustomCategory = {
      id: crypto.randomUUID(),
      name,
      color,
      icon,
    };
    setCustomCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  const deleteCustomCategory = useCallback((id: string) => {
    setCustomCategories(prev => prev.filter(c => c.id !== id));
    // Update habits using this category to 'productivity' fallback
    setHabits(prev =>
      prev.map(h =>
        h.category === 'custom' && h.customCategoryName === id
          ? { ...h, category: 'productivity' as HabitCategory, customCategoryName: undefined }
          : h
      )
    );
  }, []);

  // STATS & ANALYTICS
  const habitsWithStats = useMemo((): HabitWithStats[] => {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return habits.map(habit => {
      const habitLogs = logs.filter(l => l.habitId === habit.id && l.completed);
      const currentStreak = calculateStreak(habit.id, logs);

      // Calculate longest streak
      let longestStreak = currentStreak;
      // (Simplified: just use current streak for now, full implementation would track historical)

      // Completions this month
      const completionsThisMonth = habitLogs.filter(l => {
        const logDate = parseISO(l.date);
        return logDate >= currentMonthStart && logDate <= today;
      }).length;

      const totalCompletions = habitLogs.length;
      const daysSinceCreated = differenceInDays(today, parseISO(habit.createdAt));
      const { strength, phase } = calculateHabitStrength(totalCompletions, daysSinceCreated);

      return {
        ...habit,
        currentStreak,
        longestStreak,
        strength,
        phase,
        completionsThisMonth,
        totalCompletions,
      };
    });
  }, [habits, logs]);

  // Get habits by category
  const getHabitsByCategory = useCallback(
    (category: HabitCategory) => {
      return habitsWithStats.filter(h => h.category === category);
    },
    [habitsWithStats]
  );

  // Get milestone notifications
  const getMilestones = useCallback(() => {
    return habitsWithStats
      .filter(h => h.currentStreak === 5 || h.currentStreak === 21 || h.currentStreak === 66)
      .map(h => ({
        habitId: h.id,
        habitName: h.name,
        streak: h.currentStreak,
        milestone:
          h.currentStreak === 5
            ? '5-day streak! 🎉'
            : h.currentStreak === 21
            ? '21-day milestone! 🌟'
            : '66-day automatic habit! 🏆',
      }));
  }, [habitsWithStats]);

  return {
    habits,
    habitsWithStats,
    logs,
    ratings,
    journals,
    customCategories,
    isLoaded,

    // Habit CRUD
    addHabit,
    updateHabit,
    deleteHabit,

    // Logging
    toggleLog,
    isCompleted,

    // Ratings
    addRating,
    getWeeklyRating,

    // Journaling
    saveJournalEntry,
    getJournalEntry,

    // Categories
    addCustomCategory,
    deleteCustomCategory,

    // Analytics
    getHabitsByCategory,
    getMilestones,
  };
}
