import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { hapticLight } from '@/lib/haptics';
import { useFooter } from '@/contexts/FooterContext';

interface NavItem {
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  label: string;
  path: string;
}

// Custom Map Icon - Folded map with 3 panels
const MapIcon = ({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
    <path d="M9 3v15" />
    <path d="M15 6v15" />
  </svg>
);

// Custom Places Icon - Location pin with inner circle (MUVO style)
const PlacesIcon = ({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 21c-4-4-8-7.5-8-11a8 8 0 1 1 16 0c0 3.5-4 7-8 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

// Custom Routes Icon - Curved path with start dot and end arrow
const RoutesIcon = ({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="5" cy="6" r="2" fill="currentColor" stroke="none" />
    <path d="M5 8c0 4 6 4 6 8s6 4 6 4" />
    <path d="M17 17l3 3-3 3" />
  </svg>
);

// Custom Saved Icon - Bookmark with rounded shape
const SavedIcon = ({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v17l-7-4-7 4V4z" />
  </svg>
);

// Custom Profile Icon - Minimal user silhouette
const ProfileIcon = ({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const navItems: NavItem[] = [
  { icon: MapIcon, label: 'Map', path: '/map' },
  { icon: PlacesIcon, label: 'Places', path: '/places' },
  { icon: RoutesIcon, label: 'Routes', path: '/route' },
  { icon: SavedIcon, label: 'Saved', path: '/saved' },
  { icon: ProfileIcon, label: 'Profile', path: '/auth' },
];

// Paths where footer should always be hidden (forms, auth, creation flows)
const HIDDEN_PATHS = [
  '/auth',
  '/admin/import',
  '/admin/data-enrichment',
  '/admin/suggestions',
  '/admin/photos',
  '/admin/users',
  '/admin/place-submissions',
];

// Paths where footer is visible
const VISIBLE_PATHS = [
  '/',
  '/map',
  '/places',
  '/route',
  '/saved',
  '/search',
  '/notifications',
];

export function BottomNav() {
  const location = useLocation();
  const { isMapInteracting } = useFooter();
  
  const pathname = location.pathname;
  
  // Check if current path should hide footer
  const shouldHideForPath = HIDDEN_PATHS.some(path => pathname.startsWith(path));
  
  // Check if current path is a visible path or a place detail page
  const isVisiblePath = VISIBLE_PATHS.includes(pathname) || pathname.startsWith('/place/');
  
  // Hide footer on hidden paths
  if (shouldHideForPath) {
    return null;
  }
  
  // Only show on explicitly visible paths
  if (!isVisiblePath) {
    return null;
  }

  // Map View: hide when user is interacting (dragging/zooming)
  const isMapPage = pathname === '/map';
  const shouldHideForMapInteraction = isMapPage && isMapInteracting;

  const handleNavClick = () => {
    hapticLight();
  };

  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50',
        'transition-transform duration-300 ease-out',
        shouldHideForMapInteraction && 'translate-y-full'
      )}
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-2 px-3 rounded-xl transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              style={{ minHeight: '44px' }}
            >
              <div className={cn(
                'relative flex items-center justify-center rounded-full transition-colors',
                isActive && 'bg-primary/10 px-3 py-1'
              )}>
                <Icon 
                  className="w-6 h-6" 
                  strokeWidth={isActive ? 2.25 : 2}
                />
              </div>
              <span className={cn(
                'text-[10px] font-medium tracking-tight',
                isActive && 'text-primary'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
