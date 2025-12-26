import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight, CheckCircle, User, MapPin, Compass, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, TravelerType } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { UserProfileCard } from '@/components/UserProfileCard';
import { supabase } from '@/integrations/supabase/client';

// Schemas
const emailPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signInEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const profileCompletionSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .regex(/^[a-z0-9]+$/, 'Only lowercase letters and numbers allowed'),
  fullName: z
    .string()
    .min(3, 'Please enter your full name')
    .max(100, 'Name is too long')
    .regex(/^[A-Za-z'-]+(\s+[A-Za-z'-]+)+$/, 'Please enter first and last name (letters only)'),
  travelerType: z.string().optional(),
  homeBase: z.string().max(100, 'Home base is too long').optional(),
});

type EmailPasswordForm = z.infer<typeof emailPasswordSchema>;
type SignInEmailForm = z.infer<typeof signInEmailSchema>;
type ProfileCompletionForm = z.infer<typeof profileCompletionSchema>;

type AuthMode = 'signup' | 'signin' | 'check-email' | 'confirmed' | 'complete-profile';

const TRAVELER_TYPES: { value: TravelerType; label: string; icon: string }[] = [
  { value: 'rv_full_timer', label: 'RV Full-Timer', icon: '🚐' },
  { value: 'weekend_rver', label: 'Weekend RVer', icon: '🏕️' },
  { value: 'van_life', label: 'Van Life', icon: '🚌' },
  { value: 'tent_camper', label: 'Tent Camper', icon: '⛺' },
  { value: 'just_exploring', label: 'Just Exploring', icon: '🧭' },
];

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { 
    user, 
    profile, 
    loading, 
    needsProfileCompletion,
    signInWithEmail,
    signUp,
    signOut,
    checkUsernameAvailable,
    completeProfile,
    refreshProfile,
  } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('signup');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [selectedTravelerType, setSelectedTravelerType] = useState<TravelerType | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const signUpForm = useForm<EmailPasswordForm>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { email: '', password: '' },
  });

  const signInForm = useForm<SignInEmailForm>({
    resolver: zodResolver(signInEmailSchema),
    defaultValues: { email: '', password: '' },
  });

  const profileForm = useForm<ProfileCompletionForm>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: { username: '', fullName: '', travelerType: '', homeBase: '' },
  });

  // Watch username for availability check
  const watchedUsername = profileForm.watch('username');

  useEffect(() => {
    if (watchedUsername && watchedUsername.length >= 3) {
      const timer = setTimeout(async () => {
        setCheckingUsername(true);
        const available = await checkUsernameAvailable(watchedUsername);
        setUsernameAvailable(available);
        setCheckingUsername(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
    }
  }, [watchedUsername, checkUsernameAvailable]);

  // Check URL params for mode and handle email confirmation
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signin') {
      setMode('signin');
    }
    
    // Handle email confirmation callback
    const handleEmailConfirmation = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'signup' && accessToken) {
        const { data: { user: confirmedUser } } = await supabase.auth.getUser();
        if (confirmedUser) {
          await supabase
            .from('profiles')
            .update({ 
              email_verified: true, 
              email_verified_at: new Date().toISOString(),
              is_verified: true
            })
            .eq('id', confirmedUser.id);
          
          setMode('confirmed');
          toast({
            title: 'Email verified!',
            description: 'Your account is now fully verified.',
          });
          
          window.history.replaceState(null, '', window.location.pathname);
          
          // Check if profile needs completion
          setTimeout(async () => {
            await refreshProfile();
          }, 500);
        }
      }
    };
    
    handleEmailConfirmation();
  }, [searchParams, toast, refreshProfile]);

  // Switch to profile completion mode if needed
  useEffect(() => {
    if (!loading && user && profile && needsProfileCompletion) {
      setMode('complete-profile');
    }
  }, [loading, user, profile, needsProfileCompletion]);

  // Sign up with email
  async function handleSignUp(data: EmailPasswordForm) {
    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setSignupEmail(data.email);
    setMode('check-email');
  }

  // Sign in with email
  async function handleSignIn(data: SignInEmailForm) {
    setIsSubmitting(true);
    const { error } = await signInWithEmail(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Welcome back!',
    });
    navigate('/');
  }

  // Complete profile
  async function handleProfileCompletion(data: ProfileCompletionForm) {
    if (!usernameAvailable) {
      toast({
        title: 'Username unavailable',
        description: 'Please choose a different username.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await completeProfile({
      username: data.username,
      full_name: data.fullName,
      traveler_type: selectedTravelerType,
      home_base: data.homeBase || null,
    });
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Failed to save profile',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Welcome to MUVO!',
      description: 'Your profile is all set.',
    });
    navigate('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  // Email confirmed successfully
  if (mode === 'confirmed') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h1 className="font-display text-xl font-semibold mb-2">Email Verified!</h1>
            <p className="text-muted-foreground mb-4">
              Now let's set up your profile...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Profile completion step
  if (mode === 'complete-profile' && user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="font-display text-xl font-semibold mb-2">Almost there!</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Tell us a bit about yourself so other travelers can trust your reviews.
            </p>

            <form onSubmit={profileForm.handleSubmit(handleProfileCompletion)} className="space-y-5">
              {/* Username */}
              <div>
                <Label htmlFor="username" className="flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5" />
                  Username <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="username"
                    placeholder="roadlifemike"
                    className="lowercase"
                    {...profileForm.register('username')}
                  />
                  {checkingUsername && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      Checking...
                    </span>
                  )}
                  {!checkingUsername && usernameAvailable === true && watchedUsername.length >= 3 && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-destructive">
                      Taken
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lowercase letters and numbers only. This is your public handle.
                </p>
                {profileForm.formState.errors.username && (
                  <p className="text-sm text-destructive mt-1">
                    {profileForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Mike Johnson"
                  className="mt-1.5"
                  {...profileForm.register('fullName')}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your name will be shown on your reviews.
                </p>
                {profileForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive mt-1">
                    {profileForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Traveler Type */}
              <div>
                <Label className="flex items-center gap-1 mb-2">
                  <Compass className="w-3.5 h-3.5" />
                  Traveler Type <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {TRAVELER_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedTravelerType(
                        selectedTravelerType === type.value ? null : type.value
                      )}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                        selectedTravelerType === type.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Home Base */}
              <div>
                <Label htmlFor="homeBase" className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Home Base <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="homeBase"
                  placeholder="Austin, TX"
                  className="mt-1.5"
                  {...profileForm.register('homeBase')}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Where you're from. Just city and state/country.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || usernameAvailable === false}
              >
                {isSubmitting ? 'Saving...' : 'Complete Profile'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Check email screen after signup
  if (mode === 'check-email') {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-xl font-semibold mb-2">Check your email</h1>
            <p className="text-muted-foreground mb-4">
              We sent a verification link to:
            </p>
            <p className="font-medium text-foreground mb-6">{signupEmail}</p>
            <p className="text-sm text-muted-foreground mb-6">
              Click the link in the email to verify your account and start contributing.
            </p>
            <Button variant="outline" onClick={() => setMode('signin')}>
              Back to Sign In
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // User is logged in and profile is complete - show profile
  if (user && profile && profile.profile_completed) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <UserProfileCard profile={profile} />
          
          {/* Show verification status */}
          {!profile.is_verified && (
            <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning">
                ⚠️ Please verify your email to contribute. Check your inbox for the verification link.
              </p>
            </div>
          )}
          
          <div className="mt-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/profile/${profile.username}`)}
            >
              View Public Profile
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={async () => {
                await signOut();
                navigate('/auth');
              }}
            >
              Sign out
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // User is logged in but profile not complete - should not reach here but fallback
  if (user && profile && !profile.profile_completed) {
    setMode('complete-profile');
    return null;
  }

  // Sign in form
  if (mode === 'signin') {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="font-display text-xl font-semibold mb-6">Welcome back</h1>

            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...signInForm.register('email')}
                  />
                </div>
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...signInForm.register('password')}
                  />
                </div>
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button variant="link" onClick={() => setMode('signup')}>
                Don't have an account? Sign up
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Default: Sign up form
  return (
    <div className="min-h-screen bg-background">
      <Header showBack />
      <main className="container px-4 py-8 max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-6">
          <h1 className="font-display text-xl font-semibold mb-2">Get started</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Create an account with your email and password.
          </p>

          <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
            <div>
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...signUpForm.register('email')}
                />
              </div>
              {signUpForm.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {signUpForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...signUpForm.register('password')}
                />
              </div>
              {signUpForm.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {signUpForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => setMode('signin')}>
              Already have an account? Sign in
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
