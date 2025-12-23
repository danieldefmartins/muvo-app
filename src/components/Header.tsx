import { ArrowLeft, Map, User, LogOut, Heart, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { NotificationBell } from '@/components/NotificationBell';

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
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

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
            <h1 className="font-display font-semibold text-foreground text-lg leading-tight">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-1">
          {showMap && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Map className="w-5 h-5" />
            </Button>
          )}

          {user && (
            <>
              <NotificationBell />
              <Button
                asChild
                variant="ghost"
                size="icon"
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  location.pathname === '/saved' && "text-primary"
                )}
              >
                <Link to="/saved" aria-label="Saved places">
                  <Heart className="w-5 h-5" />
                </Link>
              </Button>
            </>
          )}

          {isAdmin && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-foreground",
                location.pathname === '/admin/suggestions' && "text-primary"
              )}
            >
              <Link to="/admin/suggestions" aria-label="Admin panel">
                <Shield className="w-5 h-5" />
              </Link>
            </Button>
          )}

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link to="/auth" aria-label="Sign in">
                <User className="w-5 h-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

