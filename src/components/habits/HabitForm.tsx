import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useHabits, Habit } from '@/hooks/useHabits';

const HABIT_COLORS = [
  { name: 'Teal', value: '#0D9488' },
  { name: 'Coral', value: '#EA580C' },
  { name: 'Purple', value: '#9333EA' },
  { name: 'Yellow', value: '#CA8A04' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Pink', value: '#DB2777' },
  { name: 'Orange', value: '#F97316' },
];

const HABIT_ICONS = [
  { name: 'Circle', value: 'circle' },
  { name: 'Star', value: 'star' },
  { name: 'Heart', value: 'heart' },
  { name: 'Check', value: 'check' },
  { name: 'Flame', value: 'flame' },
  { name: 'Droplet', value: 'droplet' },
  { name: 'Book', value: 'book' },
  { name: 'Dumbbell', value: 'dumbbell' },
];

interface HabitFormProps {
  habit?: Habit;
  onClose?: () => void;
}

export default function HabitForm({ habit, onClose }: HabitFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(habit?.name || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(habit?.frequency || 'daily');
  const [color, setColor] = useState(habit?.color || HABIT_COLORS[0].value);
  const [icon, setIcon] = useState(habit?.icon || 'circle');
  
  const { createHabit, updateHabit } = useHabits();
  const isEditing = !!habit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && habit) {
      await updateHabit.mutateAsync({ id: habit.id, name, frequency, color, icon });
    } else {
      await createHabit.mutateAsync({ name, frequency, color, icon });
    }
    
    setName('');
    setFrequency('daily');
    setColor(HABIT_COLORS[0].value);
    setIcon('circle');
    setOpen(false);
    onClose?.();
  };

  const isPending = createHabit.isPending || updateHabit.isPending;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Habit Name</Label>
        <Input
          id="name"
          placeholder="e.g., Drink water, Exercise, Read"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-12 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label>Frequency</Label>
        <Select value={frequency} onValueChange={(v: 'daily' | 'weekly') => setFrequency(v)}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {HABIT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-8 h-8 rounded-full transition-all duration-200 ${
                color === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <Select value={icon} onValueChange={setIcon}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HABIT_ICONS.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1"
          onClick={() => {
            setOpen(false);
            onClose?.();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" variant="hero" className="flex-1" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Update Habit' : 'Create Habit'
          )}
        </Button>
      </div>
    </form>
  );

  // If editing, just render the form content (parent controls the dialog)
  if (isEditing) {
    return formContent;
  }

  // For creating new habits, render with dialog
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="gap-2">
          <Plus className="w-5 h-5" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Create New Habit</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
