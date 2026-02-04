-- Create habits table
CREATE TABLE public.habits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
    color TEXT NOT NULL DEFAULT '#0EA5E9',
    icon TEXT NOT NULL DEFAULT 'circle',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create habit_logs table
CREATE TABLE public.habit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(habit_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits
CREATE POLICY "Users can view their own habits" 
ON public.habits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits" 
ON public.habits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" 
ON public.habits FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" 
ON public.habits FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for habit_logs (join to habits to check ownership)
CREATE POLICY "Users can view their own habit logs" 
ON public.habit_logs FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.habits 
    WHERE habits.id = habit_logs.habit_id 
    AND habits.user_id = auth.uid()
));

CREATE POLICY "Users can create their own habit logs" 
ON public.habit_logs FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.habits 
    WHERE habits.id = habit_logs.habit_id 
    AND habits.user_id = auth.uid()
));

CREATE POLICY "Users can update their own habit logs" 
ON public.habit_logs FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.habits 
    WHERE habits.id = habit_logs.habit_id 
    AND habits.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own habit logs" 
ON public.habit_logs FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.habits 
    WHERE habits.id = habit_logs.habit_id 
    AND habits.user_id = auth.uid()
));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for habits
CREATE TRIGGER update_habits_updated_at
BEFORE UPDATE ON public.habits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX idx_habit_logs_date ON public.habit_logs(date);