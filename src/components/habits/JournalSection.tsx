import { useState, useEffect } from 'react';
import { BookOpen, Plus, Sparkles, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { JournalEntry } from '@/types/habits';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface JournalSectionProps {
  date: string;
  entry?: JournalEntry;
  onSave: (date: string, content: string, wins: string[], misses: string[]) => void;
}

export function JournalSection({ date, entry, onSave }: JournalSectionProps) {
  const [content, setContent] = useState(entry?.content || '');
  const [wins, setWins] = useState<string[]>(entry?.wins || []);
  const [misses, setMisses] = useState<string[]>(entry?.misses || []);
  const [newWin, setNewWin] = useState('');
  const [newMiss, setNewMiss] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setContent(entry?.content || '');
    setWins(entry?.wins || []);
    setMisses(entry?.misses || []);
    setHasChanges(false);
  }, [entry, date]);

  const addWin = () => {
    if (newWin.trim()) {
      setWins(prev => [...prev, newWin.trim()]);
      setNewWin('');
      setHasChanges(true);
    }
  };

  const addMiss = () => {
    if (newMiss.trim()) {
      setMisses(prev => [...prev, newMiss.trim()]);
      setNewMiss('');
      setHasChanges(true);
    }
  };

  const removeWin = (index: number) => {
    setWins(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const removeMiss = (index: number) => {
    setMisses(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(date, content, wins, misses);
    setHasChanges(false);
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">Evening Journal</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {format(new Date(date), 'EEEE, MMMM d')}
        </span>
      </div>

      <div className="space-y-4">
        {/* Small Wins */}
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-success" />
            Celebrate Small Wins
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {wins.map((win, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-sm"
              >
                <span>{win}</span>
                <button onClick={() => removeWin(index)} className="hover:text-success/70">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newWin}
              onChange={(e) => setNewWin(e.target.value)}
              placeholder="Add a win..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWin())}
            />
            <Button variant="outline" size="icon" onClick={addWin}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Misses / Challenges */}
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            Why I Missed (No Judgment)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {misses.map((miss, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-warning/10 text-warning text-sm"
              >
                <span>{miss}</span>
                <button onClick={() => removeMiss(index)} className="hover:text-warning/70">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newMiss}
              onChange={(e) => setNewMiss(e.target.value)}
              placeholder="What got in the way?"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMiss())}
            />
            <Button variant="outline" size="icon" onClick={addMiss}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Free-form Journal */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Reflections
          </label>
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setHasChanges(true);
            }}
            placeholder="How did today go? Any insights about your habits?"
            rows={4}
          />
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button onClick={handleSave} className="w-full">
            Save Journal Entry
          </Button>
        )}
      </div>
    </div>
  );
}
