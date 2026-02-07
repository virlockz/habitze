import { useEffect } from 'react';
import { toast } from 'sonner';
import { Trophy, Star, Zap, Sparkles } from 'lucide-react';

interface Milestone {
  habitId: string;
  habitName: string;
  streak: number;
  milestone: string;
}

interface MilestoneToastProps {
  milestones: Milestone[];
  shownMilestones: Set<string>;
  onMilestoneShown: (key: string) => void;
}

export function MilestoneToast({ milestones, shownMilestones, onMilestoneShown }: MilestoneToastProps) {
  useEffect(() => {
    milestones.forEach(({ habitId, habitName, streak, milestone }) => {
      const key = `${habitId}-${streak}`;
      
      if (!shownMilestones.has(key)) {
        const Icon = streak >= 66 ? Trophy : streak >= 21 ? Zap : Star;
        
        toast.success(milestone, {
          description: `${habitName} - Keep the chain going!`,
          duration: 5000,
          icon: <Icon className="w-5 h-5 text-yellow-500" />,
        });
        
        onMilestoneShown(key);
      }
    });
  }, [milestones, shownMilestones, onMilestoneShown]);

  return null;
}
