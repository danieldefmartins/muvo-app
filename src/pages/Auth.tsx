import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
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

type EmailPasswordForm = z.infer<typeof emailPasswordSchema>;
type SignInEmailForm = z.infer<typeof signInEmailSchema>;

type AuthMode = 'signup' | 'signin' | 'check-email' | 'confirmed';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { 
    user, 
    profile, 
    loading, 
    signInWithEmail,
    signUp,
    signOut,
    refreshProfile,
  } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('signup');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  const signUpForm = useForm<EmailPasswordForm>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { email: '', password: '' },
  });

  const signInForm = useForm<SignInEmailForm>({
    resolver: zodResolver(signInEmailSchema),
    defaultValues: { email: '', password: '' },
  });

  // Check URL params for mode and handle email confirmation
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signin') {
      setMode('signin');
    }
    
    // Handle email confirmation callback - when user clicks the link in their email
    const handleEmailConfirmation = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'signup' && accessToken) {
        // User just confirmed their email - update their profile
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
          
          // Clear the hash and redirect after a moment
          window.history.replaceState(null, '', window.location.pathname);
          setTimeout(() => navigate('/'), 2000);
        }
      }
    };
    
    handleEmailConfirmation();
  }, [searchParams, toast, navigate]);

  // Redirect if user is logged in and verified
  useEffect(() => {
    if (!loading && user && profile?.is_verified) {
      // User is fully verified, can redirect
    }
  }, [user, profile, loading]);

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

    // Show check-email screen
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Account" />
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
        <Header title="Email Verified" />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h1 className="font-display text-xl font-semibold mb-2">Email Verified!</h1>
            <p className="text-muted-foreground mb-4">
              Your account is now fully verified. Redirecting...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Check email screen after signup
  if (mode === 'check-email') {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Check Your Email" showBack />
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

  // User is logged in - show profile
  if (user && profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="My Profile" showBack />
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
          
          <div className="mt-4">
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

  // Sign in form
  if (mode === 'signin') {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Sign In" showBack />
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
      <Header title="Create Account" showBack />
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
