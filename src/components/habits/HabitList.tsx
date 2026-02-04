import { useState } from 'react';
import { format } from 'date-fns';
import { useHabits, useHabitLogs } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Check, Pencil, Trash2, Loader2 } from 'lucide-react';
import HabitForm from './HabitForm';
import { cn } from '@/lib/utils';

export default function HabitList() {
  const { habits, isLoading, deleteHabit } = useHabits();
  const today = new Date();
  const { logs, toggleHabitLog } = useHabitLogs(today, today);
  const [editingHabit, setEditingHabit] = useState<typeof habits[0] | null>(null);
  
  const todayStr = format(today, 'yyyy-MM-dd');

  const isHabitCompleteToday = (habitId: string) => {
    return logs.some(log => log.habit_id === habitId && log.date === todayStr && log.completed);
  };

  const handleToggle = (habitId: string) => {
    toggleHabitLog.mutate({ habitId, date: todayStr });
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6 text-center">
        <div className="py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No habits yet</h3>
          <p className="text-muted-foreground text-sm">
            Create your first habit to start tracking your progress!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-2xl shadow-card p-4 md:p-6">
        <h3 className="font-display text-lg text-foreground mb-4">Today's Habits</h3>
        
        <div className="space-y-3">
          {habits.map(habit => {
            const isComplete = isHabitCompleteToday(habit.id);
            
            return (
              <div
                key={habit.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                  isComplete ? "bg-success/10" : "bg-secondary/50 hover:bg-secondary"
                )}
              >
                <button
                  onClick={() => handleToggle(habit.id)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                    isComplete 
                      ? "bg-success text-success-foreground habit-complete" 
                      : "border-2 hover:border-primary"
                  )}
                  style={{ 
                    borderColor: isComplete ? undefined : habit.color,
                    backgroundColor: isComplete ? habit.color : undefined
                  }}
                >
                  {isComplete && <Check className="w-5 h-5" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-foreground truncate",
                    isComplete && "line-through opacity-70"
                  )}>
                    {habit.name}
                  </h4>
                  <p className="text-xs text-muted-foreground capitalize">{habit.frequency}</p>
                </div>

                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setEditingHabit(habit)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{habit.name}"? All tracking data for this habit will be lost.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteHabit.mutate(habit.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingHabit} onOpenChange={(open) => !open && setEditingHabit(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit Habit</DialogTitle>
          </DialogHeader>
          {editingHabit && (
            <HabitForm 
              habit={editingHabit} 
              onClose={() => setEditingHabit(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
