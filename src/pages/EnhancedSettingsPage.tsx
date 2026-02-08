import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEnhancedHabits, HabitWithStats } from '@/hooks/useEnhancedHabits';
import { HabitFormModal } from '@/components/habits/HabitFormModal';
import { Habit, PRESET_CATEGORIES, CustomCategory, HabitCategory } from '@/types/habits';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export default function EnhancedSettingsPage() {
  const {
    habitsWithStats,
    customCategories,
    isLoaded,
    addHabit,
    updateHabit,
    deleteHabit,
    addCustomCategory,
    deleteCustomCategory,
  } = useEnhancedHabits();

  const [editingHabit, setEditingHabit] = useState<HabitWithStats | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#10b981');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCustomCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName('');
      setNewCategoryColor('#10b981');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-6">
        Settings
      </h1>

      {/* Add New Habit */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Add New Habit
        </h2>
        <HabitFormModal
          onSubmit={addHabit}
          customCategories={customCategories}
          trigger={
            <Button className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Create New Habit
            </Button>
          }
        />
      </div>

      {/* Existing Habits */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Your Habits ({habitsWithStats.length})
        </h2>

        {habitsWithStats.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No habits yet. Create one above to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {habitsWithStats.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {PRESET_CATEGORIES[habit.category as keyof typeof PRESET_CATEGORIES]?.name || 'Custom'} 
                    • {habit.schedule.type === 'daily' ? 'Daily' : 
                       habit.schedule.type === 'weekly' ? `${habit.schedule.targetDays?.length} days/week` :
                       `${habit.schedule.targetCount}x/month`}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-2">
                    {habit.strength}% strength
                  </span>
                  
                  <HabitFormModal
                    mode="edit"
                    initialData={habit}
                    customCategories={customCategories}
                    onSubmit={(data) => updateHabit(habit.id, data)}
                    trigger={
                      <Button size="icon" variant="ghost">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    }
                  />
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &ldquo;{habit.name}&rdquo;? This will remove all tracking history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteHabit(habit.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Categories */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Custom Categories
        </h2>

        <form onSubmit={handleAddCategory} className="flex gap-3 mb-4">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name..."
            className="flex-1"
          />
          <div className="relative">
            <input
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-success bg-success/20"
            />
          </div>
          <Button type="submit" disabled={!newCategoryName.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </form>

        {/* Preset Categories */}
        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground">Preset Categories</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESET_CATEGORIES).map(([key, { name, color }]) => (
              <div
                key={key}
                className="px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Custom Categories List */}
        {customCategories.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Your Custom Categories</p>
            <div className="flex flex-wrap gap-2">
              {customCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="px-3 py-1.5 rounded-full text-sm flex items-center gap-2 group"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                  <button
                    onClick={() => deleteCustomCategory(cat.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
