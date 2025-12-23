import { Tent, Route, Map, Search, Star, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import heroImage from '@/assets/hero-rv-landscape.jpg';
import { usePlaces } from '@/hooks/usePlaces';

const Index = () => {
  const navigate = useNavigate();
  const { data: places } = usePlaces();
  
  // Get top rated places for discovery section
  const topPlaces = places?.slice(0, 4) || [];

  const handleSearchFocus = () => {
    navigate('/places');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Search */}
      <section className="relative h-[60vh] min-h-[400px] max-h-[600px] w-full overflow-hidden">
        {/* Hero Image */}
        <img
          src={heroImage}
          alt="RV parked at scenic mountain campsite during sunset"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        
        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 pt-safe">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-3 text-balance max-w-2xl drop-shadow-lg">
            Find your next adventure
          </h1>
          <p className="text-white/90 text-lg sm:text-xl text-center mb-8 drop-shadow-md">
            RV parks, campgrounds & hidden gems
          </p>
          
          {/* Search Bar */}
          <div 
            className="w-full max-w-md px-4"
            onClick={handleSearchFocus}
          >
            <div className="relative cursor-pointer">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Where do you want to go?"
                className="w-full h-14 pl-12 pr-4 rounded-full bg-white/95 backdrop-blur-sm border-0 shadow-lg text-foreground placeholder:text-muted-foreground text-base cursor-pointer"
                readOnly
              />
            </div>
          </div>
        </div>
      </section>

      <main className="container px-4 pb-8 max-w-4xl mx-auto -mt-6 relative z-10">
        {/* Primary Action Cards */}
        <section className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
          <Link to="/places" className="group">
            <div className="flex flex-col items-center p-4 sm:p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl gradient-hero flex items-center justify-center mb-3 shadow-glow group-hover:scale-105 transition-transform">
                <Tent className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-sm sm:text-base text-foreground text-center">
                Places to Stay
              </h3>
              <p className="text-xs text-muted-foreground text-center mt-1 hidden sm:block">
                Campgrounds & RV parks
              </p>
            </div>
          </Link>

          <Link to="/route" className="group">
            <div className="flex flex-col items-center p-4 sm:p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Route className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-sm sm:text-base text-foreground text-center">
                Plan a Route
              </h3>
              <p className="text-xs text-muted-foreground text-center mt-1 hidden sm:block">
                Places along your drive
              </p>
            </div>
          </Link>

          <Link to="/map" className="group">
            <div className="flex flex-col items-center p-4 sm:p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-trust/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Map className="w-7 h-7 sm:w-8 sm:h-8 text-trust" />
              </div>
              <h3 className="font-display font-semibold text-sm sm:text-base text-foreground text-center">
                Map View
              </h3>
              <p className="text-xs text-muted-foreground text-center mt-1 hidden sm:block">
                Explore everything
              </p>
            </div>
          </Link>
        </section>

        {/* Discovery Section */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
              Popular Near You
            </h2>
            <Link 
              to="/places" 
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {topPlaces.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {topPlaces.map((place) => (
                <Link 
                  key={place.id} 
                  to={`/places/${place.id}`}
                  className="group"
                >
                  <div className="rounded-xl overflow-hidden bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-200">
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {place.coverImageUrl ? (
                        <img 
                          src={place.coverImageUrl} 
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <Tent className="w-8 h-8 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        <span className="text-xs font-medium text-foreground">
                          {place.isVerified ? 'Verified' : 'New'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {place.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {place.primaryCategory}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Tent className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Discovering places near you...
              </p>
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-10">
          Information is based on community reports. Always verify locally.
        </p>
      </main>
    </div>
  );
};

export default Index;
