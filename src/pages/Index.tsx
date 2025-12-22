import { Tent, UtensilsCrossed, Wrench, Map, MapPin } from 'lucide-react';
import { Header } from '@/components/Header';
import { ActionCard } from '@/components/ActionCard';

const Index = () => {
  return (
    <div className="min-h-screen gradient-warm">
      <Header />

      <main className="container px-4 py-8 max-w-lg mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-hero mx-auto mb-5 flex items-center justify-center shadow-glow">
            <Tent className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
            Find RV places based on what actually matters to you
          </h1>
          <p className="text-muted-foreground text-lg">
            Real experiences from real RVers. No ads, no paid ratings.
          </p>
        </section>

        {/* Location indicator */}
        <div 
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8 animate-fade-in"
          style={{ animationDelay: '100ms' }}
        >
          <MapPin className="w-4 h-4" />
          <span>Using your current location</span>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          <ActionCard
            to="/places"
            icon={Tent}
            title="Places to Stay"
            description="RV parks, campgrounds, and boondocking spots near you"
            variant="primary"
            className="animate-fade-in"
          />

          <ActionCard
            to="/eats"
            icon={UtensilsCrossed}
            title="Can't-Miss Eats"
            description="Local restaurants and food spots RVers love"
            disabled
            className="animate-fade-in"
          />

          <ActionCard
            to="/services"
            icon={Wrench}
            title="Services & Repairs"
            description="Mechanics, mobile repair, and RV services"
            disabled
            className="animate-fade-in"
          />

          <ActionCard
            to="/map"
            icon={Map}
            title="Map View"
            description="Explore everything on an interactive map"
            className="animate-fade-in"
          />
        </div>

        {/* Disclaimer */}
        <p 
          className="text-center text-xs text-muted-foreground mt-10 animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          Information is based on community reports. Always verify locally.
        </p>
      </main>
    </div>
  );
};

export default Index;
