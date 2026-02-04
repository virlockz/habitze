import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  created_at: string;
}

export function useHabits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const habitsQuery = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user,
  });

  const createHabit = useMutation({
    mutationFn: async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('habits')
        .insert([{ ...habit, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Habit created!', description: 'Your new habit has been added.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateHabit = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Habit> & { id: string }) => {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Habit updated!', description: 'Your habit has been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habit-logs'] });
      toast({ title: 'Habit deleted', description: 'Your habit has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    habits: habitsQuery.data ?? [],
    isLoading: habitsQuery.isLoading,
    createHabit,
    updateHabit,
    deleteHabit,
  };
}

export function useHabitLogs(startDate: Date, endDate: Date) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ['habit-logs', user?.id, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: habits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id);
      
      if (!habits || habits.length === 0) return [];

      const habitIds = habits.map(h => h.id);
      
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .in('habit_id', habitIds)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);
      
      if (error) throw error;
      return data as HabitLog[];
    },
    enabled: !!user,
  });

  const toggleHabitLog = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      // Check if log exists
      const { data: existing } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('date', date)
        .maybeSingle();

      if (existing) {
        // Delete the log (toggle off)
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return null;
      } else {
        // Create the log (toggle on)
        const { data, error } = await supabase
          .from('habit_logs')
          .insert([{ habit_id: habitId, date, completed: true }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-logs'] });
    },
  });

  return {
    logs: logsQuery.data ?? [],
    isLoading: logsQuery.isLoading,
    toggleHabitLog,
  };
}
