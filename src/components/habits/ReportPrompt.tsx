import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, BarChart3 } from 'lucide-react';
import { startOfWeek, startOfMonth, format } from 'date-fns';

type ReportType = 'week' | 'month' | null;

function getReportType(): ReportType {
  const now = new Date();
  const lastCheck = localStorage.getItem('lastReportPromptCheck');
  const lastCheckDate = lastCheck ? new Date(lastCheck) : null;
  
  // Get start of current week (Monday) and month
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentMonthStart = startOfMonth(now);
  
  // Check if it's a new month first (takes priority)
  if (!lastCheckDate || lastCheckDate < currentMonthStart) {
    // Only show month report if we're within the first 3 days of the month
    const dayOfMonth = now.getDate();
    if (dayOfMonth <= 3) {
      return 'month';
    }
  }
  
  // Check if it's a new week
  if (!lastCheckDate || lastCheckDate < currentWeekStart) {
    // Only show week report if we're within the first 2 days of the week
    const dayOfWeek = now.getDay();
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday from 0 to 7
    if (adjustedDay <= 2) {
      return 'week';
    }
  }
  
  return null;
}

export function ReportPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [reportType, setReportType] = useState<ReportType>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay to let the page load first
    const timer = setTimeout(() => {
      const type = getReportType();
      if (type) {
        setReportType(type);
        setIsVisible(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('lastReportPromptCheck', new Date().toISOString());
  };

  const handleViewReport = () => {
    localStorage.setItem('lastReportPromptCheck', new Date().toISOString());
    setIsVisible(false);
    navigate('/progress');
  };

  if (!isVisible || !reportType) return null;

  const title = reportType === 'month' 
    ? "New Month Started! 🎉" 
    : "New Week Started! 📊";
  
  const message = reportType === 'month'
    ? "Would you like to see last month's habit report?"
    : "Would you like to see last week's habit report?";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleDismiss}
      />
      
      {/* Prompt Card */}
      <div className="relative z-50 w-full max-w-md mx-4 mb-4 sm:mb-0 animate-in slide-in-from-bottom duration-500 ease-out">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 p-6 pb-4">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 pt-4 space-y-5">
            <p className="text-muted-foreground">
              {message}
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDismiss}
              >
                Maybe Later
              </Button>
              <Button
                className="flex-1"
                onClick={handleViewReport}
              >
                View Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
