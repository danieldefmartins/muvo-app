import { Map, Navigation, Route } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: typeof Map;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Map, label: 'Map', path: '/map' },
  { icon: Navigation, label: 'Places', path: '/places' },
  { icon: Route, label: 'Routes', path: '/route' },
];

export function BottomNav() {
  const location = useLocation();
  
  // Hide on certain pages where it would interfere
  const hiddenPaths = ['/map', '/route'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
