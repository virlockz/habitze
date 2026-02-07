import { useState } from 'react';
import { Brain, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HabitWithStats } from '@/hooks/useEnhancedHabits';
import { AutomaticityRating } from '@/types/habits';
import { cn } from '@/lib/utils';

interface AutomaticityScorecardProps {
  habits: HabitWithStats[];
  getWeeklyRating: (habitId: string) => AutomaticityRating | undefined;
  onRate: (habitId: string, rating: number, notes?: string) => void;
}

const RATING_LABELS = [
  { value: 1, label: 'Very Deliberate', description: 'Required significant mental effort' },
  { value: 2, label: 'Deliberate', description: 'Needed reminders and willpower' },
  { value: 3, label: 'Moderate', description: 'Some effort but getting easier' },
  { value: 4, label: 'Mostly Automatic', description: 'Did it with minimal thinking' },
  { value: 5, label: 'Fully Automatic', description: 'Did it without thinking at all' },
];

export function AutomaticityScorecard({
  habits,
  getWeeklyRating,
  onRate,
}: AutomaticityScorecardProps) {
  const [open, setOpen] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Initialize with existing ratings
  const initializeRatings = () => {
    const initial: Record<string, number> = {};
    const initialNotes: Record<string, string> = {};
    
    habits.forEach(habit => {
      const existing = getWeeklyRating(habit.id);
      if (existing) {
        initial[habit.id] = existing.rating;
        if (existing.notes) initialNotes[habit.id] = existing.notes;
      }
    });
    
    setSelectedRatings(initial);
    setNotes(initialNotes);
  };

  const handleSubmit = () => {
    Object.entries(selectedRatings).forEach(([habitId, rating]) => {
      onRate(habitId, rating, notes[habitId]);
    });
    setOpen(false);
  };

  const avgRating = habits.length > 0
    ? habits.reduce((sum, h) => {
        const rating = getWeeklyRating(h.id);
        return sum + (rating?.rating || 0);
      }, 0) / habits.length
    : 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) initializeRatings();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Brain className="w-4 h-4" />
          Weekly Reflection
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Automaticity Scorecard
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Rate how automatic each habit felt this week (1-5 scale)
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Rating Scale Legend */}
          <div className="grid grid-cols-5 gap-2 p-4 bg-secondary/50 rounded-lg">
            {RATING_LABELS.map(({ value, label }) => (
              <div key={value} className="text-center">
                <div className={cn(
                  'w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium',
                  'bg-primary/10 text-primary'
                )}>
                  {value}
                </div>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{label}</p>
              </div>
            ))}
          </div>

          {/* Habits */}
          {habits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No habits to rate yet. Add some habits first!
            </p>
          ) : (
            <div className="space-y-4">
              {habits.map(habit => {
                const currentRating = selectedRatings[habit.id] || 0;
                
                return (
                  <div key={habit.id} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{habit.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Streak: {habit.currentStreak} days • Strength: {habit.strength}%
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Rate how much mental effort this habit required this week</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Rating Buttons */}
                    <div className="flex gap-2 mb-3">
                      {RATING_LABELS.map(({ value, description }) => (
                        <Tooltip key={value}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setSelectedRatings(prev => ({ ...prev, [habit.id]: value }))}
                              className={cn(
                                'w-10 h-10 rounded-lg text-sm font-medium transition-all',
                                currentRating === value
                                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                              )}
                            >
                              {value}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{description}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>

                    {/* Notes */}
                    <Textarea
                      value={notes[habit.id] || ''}
                      onChange={(e) => setNotes(prev => ({ ...prev, [habit.id]: e.target.value }))}
                      placeholder="Any notes about this habit this week..."
                      className="text-sm"
                      rows={2}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Save Ratings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
