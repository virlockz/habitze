import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, BarChart3, Calendar, Sparkles, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Visual Calendar',
      description: 'Track your habits with a beautiful monthly calendar view',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'See your progress with pie charts and trend graphs',
    },
    {
      icon: Check,
      title: 'Easy Tracking',
      description: 'Mark habits complete with a single tap',
    },
    {
      icon: Sparkles,
      title: 'Stay Motivated',
      description: 'Watch your streaks grow and celebrate wins',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Build better habits, one day at a time
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
              Track Your Habits,
              <span className="block text-primary">Transform Your Life</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              A beautiful, minimal habit tracker that helps you build consistency. 
              Track daily and weekly habits, visualize your progress, and achieve your goals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="xl" 
                onClick={() => navigate('/auth')}
                className="group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Simple yet powerful features designed to help you build lasting habits
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-card rounded-3xl shadow-card p-8 md:p-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-3xl text-foreground mb-4">
                Visualize your progress
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                See your habit completion at a glance with our intuitive calendar view. 
                Swipe through months and watch your consistency grow.
              </p>
              <ul className="space-y-3">
                {['Monthly calendar view', 'Swipe navigation', 'Color-coded habits', 'Real-time updates'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-6 aspect-square flex items-center justify-center">
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg ${
                      Math.random() > 0.4 
                        ? 'bg-primary/80' 
                        : 'bg-muted'
                    } transition-all duration-300`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="gradient-hero rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-primary-foreground mb-4">
            Ready to build better habits?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of people who are transforming their lives one habit at a time.
          </p>
          <Button 
            variant="secondary" 
            size="xl" 
            onClick={() => navigate('/auth')}
            className="hover:scale-105 transition-transform"
          >
            Start Tracking Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="text-center text-muted-foreground text-sm">
          <p>Built with ❤️ for habit builders everywhere</p>
        </div>
      </footer>
    </div>
  );
}
