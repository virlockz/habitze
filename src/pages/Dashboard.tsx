import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HabitCalendar from '@/components/habits/HabitCalendar';
import HabitList from '@/components/habits/HabitList';
import HabitForm from '@/components/habits/HabitForm';
import HabitAnalytics from '@/components/habits/HabitAnalytics';
import { LogOut, Calendar, BarChart3, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl md:text-2xl text-foreground">Habit Tracker</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <HabitForm />
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-secondary">
            <TabsTrigger 
              value="calendar" 
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6 fade-in">
            <HabitCalendar onMonthChange={setCurrentMonth} />
            <HabitList />
          </TabsContent>

          <TabsContent value="analytics" className="fade-in">
            <HabitAnalytics currentMonth={currentMonth} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
