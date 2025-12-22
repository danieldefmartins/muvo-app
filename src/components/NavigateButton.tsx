import { Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { hapticMedium } from '@/lib/haptics';

interface NavigateButtonProps {
  latitude: number;
  longitude: number;
  name: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export function NavigateButton({ latitude, longitude, name, variant = 'default', className }: NavigateButtonProps) {
  const handleNavigate = () => {
    hapticMedium();
    
    // Detect platform and open appropriate maps app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const encodedName = encodeURIComponent(name);
    
    if (isIOS) {
      // Apple Maps
      window.open(`maps://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodedName}`, '_blank');
    } else {
      // Google Maps (works on Android and web)
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodedName}`, '_blank');
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('gap-1.5', className)}
        onClick={handleNavigate}
      >
        <Navigation className="w-3.5 h-3.5" />
        Navigate
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className={cn('gap-2', className)}
      onClick={handleNavigate}
    >
      <Navigation className="w-4 h-4" />
      Get Directions
    </Button>
  );
}
