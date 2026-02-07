import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEnhancedHabits } from '@/hooks/useEnhancedHabits';
import { HabitFormModal } from '@/components/habits/HabitFormModal';
import { CategorySection } from '@/components/habits/CategorySection';
import { StreakChain } from '@/components/habits/StreakChain';
import { JournalSection } from '@/components/habits/JournalSection';
import { AutomaticityScorecard } from '@/components/habits/AutomaticityScorecard';
import { MilestoneToast } from '@/components/habits/MilestoneToast';
import { HabitCategory, PRESET_CATEGORIES, Habit } from '@/types/habits';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function HabitDashboard() {
  const {
    habitsWithStats,
    logs,
    customCategories,
    isLoaded,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleLog,
    isCompleted,
    addRating,
    getWeeklyRating,
    saveJournalEntry,
    getJournalEntry,
    getMilestones,
  } = useEnhancedHabits();

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [shownMilestones, setShownMilestones] = useState<Set<string>>(new Set());

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = getJournalEntry(today);
  const milestones = getMilestones();

  const handleMilestoneShown = useCallback((key: string) => {
    setShownMilestones(prev => new Set(prev).add(key));
  }, []);

  const isTodayCompleted = useCallback(
    (habitId: string) => isCompleted(habitId, today),
    [isCompleted, today]
  );

  const handleToggleToday = useCallback(
    (habitId: string) => toggleLog(habitId, today),
    [toggleLog, today]
  );

  const handleDeleteConfirm = () => {
    if (deletingHabitId) {
      deleteHabit(deletingHabitId);
      setDeletingHabitId(null);
    }
  };

  // Group habits by category
  const habitsByCategory = useMemo(() => {
    const grouped: Record<HabitCategory, typeof habitsWithStats> = {
      morning: [],
      health: [],
      academics: [],
      evening: [],
      productivity: [],
      wellness: [],
      custom: [],
    };

    habitsWithStats.forEach(habit => {
      grouped[habit.category].push(habit);
    });

    return grouped;
  }, [habitsWithStats]);

  // Category order for display
  const categoryOrder: HabitCategory[] = ['morning', 'health', 'academics', 'productivity', 'wellness', 'evening', 'custom'];

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <MilestoneToast
        milestones={milestones}
        shownMilestones={shownMilestones}
        onMilestoneShown={handleMilestoneShown}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
            Today's Habits
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AutomaticityScorecard
            habits={habitsWithStats}
            getWeeklyRating={getWeeklyRating}
            onRate={addRating}
          />
          <HabitFormModal
            onSubmit={addHabit}
            customCategories={customCategories}
          />
        </div>
      </div>

      {habitsWithStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-4xl">🌱</span>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Start Your Journey</h3>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            Create your first habit using the habit stacking method. 
            Link it to something you already do to build powerful routines.
          </p>
          <HabitFormModal
            onSubmit={addHabit}
            customCategories={customCategories}
            trigger={
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create First Habit
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Categories */}
          <div className="lg:col-span-2 space-y-2">
            {categoryOrder.map(category => (
              <CategorySection
                key={category}
                category={category}
                customCategory={
                  category === 'custom'
                    ? customCategories[0]
                    : undefined
                }
                habits={habitsByCategory[category]}
                onEditHabit={setEditingHabit}
                onDeleteHabit={setDeletingHabitId}
                onToggleToday={handleToggleToday}
                isCompleted={isTodayCompleted}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <StreakChain habits={habitsWithStats} />
            <JournalSection
              date={today}
              entry={todayEntry}
              onSave={saveJournalEntry}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingHabit && (
        <HabitFormModal
          mode="edit"
          initialData={editingHabit}
          customCategories={customCategories}
          onSubmit={(data) => {
            updateHabit(editingHabit.id, data);
            setEditingHabit(null);
          }}
          trigger={<span />}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingHabitId} onOpenChange={() => setDeletingHabitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this habit? This will remove all tracking history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
