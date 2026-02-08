import { useState } from 'react';
import { Plus, X, Sparkles, Clock, MapPin, Link2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Habit, HabitCategory, HabitSchedule, PRESET_CATEGORIES, CustomCategory } from '@/types/habits';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitFormModalProps {
  onSubmit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  customCategories: CustomCategory[];
  trigger?: React.ReactNode;
  initialData?: Partial<Habit>;
  mode?: 'create' | 'edit';
}

export function HabitFormModal({
  onSubmit,
  customCategories,
  trigger,
  initialData,
  mode = 'create',
}: HabitFormModalProps) {
  const [open, setOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState(initialData?.name || '');
  const [stackingCue, setStackingCue] = useState(initialData?.stackingCue || '');
  const [stackingAction, setStackingAction] = useState(initialData?.stackingAction || '');
  const [twoMinuteAction, setTwoMinuteAction] = useState(initialData?.twoMinuteAction || '');
  const [contextCue, setContextCue] = useState(initialData?.contextCue || '');
  const [category, setCategory] = useState<HabitCategory>(initialData?.category || 'productivity');
  const [customCategoryId, setCustomCategoryId] = useState(initialData?.customCategoryName || '');
  const [scheduleType, setScheduleType] = useState<HabitSchedule['type']>(
    initialData?.schedule?.type || 'daily'
  );
  const [targetDays, setTargetDays] = useState<number[]>(
    initialData?.schedule?.targetDays || [1, 2, 3, 4, 5] // Mon-Fri default
  );
  const [monthlyTarget, setMonthlyTarget] = useState(
    initialData?.schedule?.targetCount || 10
  );

  const resetForm = () => {
    setName('');
    setStackingCue('');
    setStackingAction('');
    setTwoMinuteAction('');
    setContextCue('');
    setCategory('productivity');
    setCustomCategoryId('');
    setScheduleType('daily');
    setTargetDays([1, 2, 3, 4, 5]);
    setMonthlyTarget(10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const schedule: HabitSchedule = {
      type: scheduleType,
      ...(scheduleType === 'weekly' && { targetDays }),
      ...(scheduleType === 'monthly' && { targetCount: monthlyTarget }),
    };

    onSubmit({
      name: name.trim(),
      stackingCue: stackingCue.trim() || undefined,
      stackingAction: stackingAction.trim() || undefined,
      twoMinuteAction: twoMinuteAction.trim() || undefined,
      contextCue: contextCue.trim() || undefined,
      category,
      customCategoryName: category === 'custom' ? customCategoryId : undefined,
      schedule,
    });

    resetForm();
    setOpen(false);
  };

  const toggleDay = (day: number) => {
    setTargetDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Habit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {mode === 'create' ? 'Create New Habit' : 'Edit Habit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Read 10 pages"
              required
            />
          </div>

          {/* Habit Stacking */}
          <div className="space-y-3 p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Link2 className="w-4 h-4 text-primary" />
              Habit Stacking
            </div>
            <p className="text-xs text-muted-foreground">
              Link this habit to an existing routine for better consistency
            </p>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="stackingCue" className="text-xs">After I...</Label>
                <Input
                  id="stackingCue"
                  value={stackingCue}
                  onChange={(e) => setStackingCue(e.target.value)}
                  placeholder="e.g., finish my morning coffee"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="stackingAction" className="text-xs">I will...</Label>
                <Input
                  id="stackingAction"
                  value={stackingAction}
                  onChange={(e) => setStackingAction(e.target.value)}
                  placeholder="e.g., read for 10 minutes"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* 2-Minute Rule */}
          <div className="space-y-2 p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              2-Minute Entry Action
            </div>
            <p className="text-xs text-muted-foreground">
              What's the smallest version you can start with?
            </p>
            <Input
              value={twoMinuteAction}
              onChange={(e) => setTwoMinuteAction(e.target.value)}
              placeholder="e.g., Open book and read 1 page"
            />
          </div>

          {/* Context Cue */}
          <div className="space-y-2 p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              Context Cue
            </div>
            <p className="text-xs text-muted-foreground">
              Where and when will you perform this habit?
            </p>
            <Input
              value={contextCue}
              onChange={(e) => setContextCue(e.target.value)}
              placeholder="e.g., In the living room after dinner"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Habit Area</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as HabitCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRESET_CATEGORIES).map(([key, { name }]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
                {customCategories.map((cat) => (
                  <SelectItem key={cat.id} value="custom">
                    {cat.name}
                  </SelectItem>
                ))}
                <SelectItem value="custom">+ Custom Category</SelectItem>
              </SelectContent>
            </Select>
            
            {category === 'custom' && (
              <Input
                value={customCategoryId}
                onChange={(e) => setCustomCategoryId(e.target.value)}
                placeholder="Enter custom category name"
                className="mt-2"
              />
            )}
          </div>

          {/* Schedule */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <Label>Schedule</Label>
            </div>
            
            <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as HabitSchedule['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Specific Days</SelectItem>
                <SelectItem value="monthly">X Times per Month</SelectItem>
              </SelectContent>
            </Select>

            {scheduleType === 'weekly' && (
              <div className="flex flex-wrap gap-2 pt-2">
                {DAYS_OF_WEEK.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={cn(
                      'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                      targetDays.includes(index)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}

            {scheduleType === 'monthly' && (
              <div className="flex items-center gap-3 pt-2">
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">times per month</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {mode === 'create' ? 'Create Habit' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
