import { Award, CheckCircle, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/hooks/useAuth';
import { TrustedBadge } from './TrustedBadge';

interface UserProfileCardProps {
  profile: Profile;
}

export function UserProfileCard({ profile }: UserProfileCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span>{profile.display_name || 'User'}</span>
          {profile.is_pro && <TrustedBadge />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Status */}
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{profile.email}</span>
          {profile.email_verified && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="w-3 h-3 text-success" />
              Verified
            </Badge>
          )}
        </div>

        {/* Contribution Stats */}
        <div className="p-4 bg-secondary/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Contributions</p>
              <p className="text-2xl font-bold text-foreground">
                {profile.contribution_score}
              </p>
              <p className="text-xs text-muted-foreground">
                Approved updates
              </p>
            </div>
            {profile.is_pro && (
              <div className="flex flex-col items-center gap-1 p-3 bg-primary/10 rounded-lg">
                <Award className="w-8 h-8 text-primary" />
                <span className="text-xs font-medium text-primary">Trusted</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
