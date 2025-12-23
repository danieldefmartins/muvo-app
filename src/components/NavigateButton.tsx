import { Navigation, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const encodedName = encodeURIComponent(name);

  const openAppleMaps = () => {
    hapticMedium();
    window.open(`maps://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodedName}`, '_blank');
  };

  const openGoogleMaps = () => {
    hapticMedium();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodedName}`, '_blank');
  };

  const openWaze = () => {
    hapticMedium();
    window.open(`https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes&q=${encodedName}`, '_blank');
  };

  const isCompact = variant === 'compact';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={isCompact ? 'sm' : 'default'}
          className={cn(isCompact ? 'gap-1.5' : 'gap-2', className)}
        >
          <Navigation className={isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          {isCompact ? 'Navigate' : 'Get Directions'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={openAppleMaps} className="gap-2 cursor-pointer">
          <MapPin className="w-4 h-4" />
          Apple Maps
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openGoogleMaps} className="gap-2 cursor-pointer">
          <MapPin className="w-4 h-4" />
          Google Maps
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openWaze} className="gap-2 cursor-pointer">
          <MapPin className="w-4 h-4" />
          Waze
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
