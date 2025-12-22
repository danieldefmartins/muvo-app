import { ArrowLeft, Map } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showMap?: boolean;
  className?: string;
}

export function Header({ title, showBack = false, showMap = false, className }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border',
        className
      )}
    >
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-foreground hover:bg-secondary"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          
          {isHome ? (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">RV</span>
              </div>
              <span className="font-display font-semibold text-foreground text-lg">RoadWise</span>
            </Link>
          ) : (
            <h1 className="font-display font-semibold text-foreground text-lg truncate">
              {title}
            </h1>
          )}
        </div>

        {showMap && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Map</span>
          </Button>
        )}
      </div>
    </header>
  );
}
