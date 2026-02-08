import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import TrackerLayout from "./layouts/TrackerLayout";
import HabitDashboard from "./pages/HabitDashboard";
import Monthly from "./pages/Monthly";
import Weekly from "./pages/Weekly";
import ProgressPage from "./pages/ProgressPage";
import EnhancedSettingsPage from "./pages/EnhancedSettingsPage";
import NotFound from "./pages/NotFound";
import { ReportPrompt } from "@/components/habits/ReportPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="habit-tracker-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ReportPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<TrackerLayout />}>
              <Route path="/dashboard" element={<HabitDashboard />} />
              <Route path="/monthly" element={<Monthly />} />
              <Route path="/weekly" element={<Weekly />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/settings" element={<EnhancedSettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
