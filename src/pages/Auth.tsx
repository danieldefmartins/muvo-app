import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Phone, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { UserProfileCard } from '@/components/UserProfileCard';

// Schemas
const phoneSchema = z.object({
  phone: z.string().min(10, 'Enter a valid phone number'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit code'),
});

const emailPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signInEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type EmailPasswordForm = z.infer<typeof emailPasswordSchema>;
type SignInEmailForm = z.infer<typeof signInEmailSchema>;

type AuthMode = 
  | 'phone-entry'      // Step 1: Enter phone number
  | 'phone-otp'        // Step 2: Verify SMS code
  | 'add-email'        // Step 3: Add email+password (after phone verified)
  | 'signin-choice'    // Sign in: Choose method
  | 'signin-phone'     // Sign in via phone
  | 'signin-phone-otp' // Sign in: verify SMS
  | 'signin-email'     // Sign in via email+password
  | 'signup-email';    // Create account via email+password

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { 
    user, 
    profile, 
    loading, 
    signInWithPhone, 
    verifyPhoneOtp, 
    signInWithEmail,
    signUp,
    updateEmailPassword,
    signOut,
    refreshProfile
  } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('phone-entry');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const emailPasswordForm = useForm<EmailPasswordForm>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { email: '', password: '' },
  });

  const signInEmailForm = useForm<SignInEmailForm>({
    resolver: zodResolver(signInEmailSchema),
    defaultValues: { email: '', password: '' },
  });

  // Check URL params for mode
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signin') {
      setMode('signin-choice');
    }
  }, [searchParams]);

  // Determine what to show based on user state
  useEffect(() => {
    if (!loading && user && profile) {
      // User is logged in, check what they need
      if (profile.phone_verified && !profile.email_verified) {
        // Phone verified but no email - prompt to add email
        setMode('add-email');
      }
    }
  }, [user, profile, loading]);

  // Phone entry for signup
  async function handlePhoneEntry(data: PhoneForm) {
    setIsSubmitting(true);
    const formattedPhone = data.phone.startsWith('+') ? data.phone : `+1${data.phone}`;
    const { error } = await signInWithPhone(formattedPhone);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Failed to send code',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setPendingPhone(formattedPhone);
    setMode('phone-otp');
    toast({
      title: 'Code sent',
      description: 'Check your phone for the verification code.',
    });
  }

  // Verify OTP for signup
  async function handlePhoneOtp(data: OtpForm) {
    setIsSubmitting(true);
    const { error } = await verifyPhoneOtp(pendingPhone, data.otp);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Verification failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Phone verified!',
      description: 'Your account has been created.',
    });
    
    // Refresh profile and navigate
    await refreshProfile();
    navigate('/');
  }

  // Sign in with phone
  async function handleSignInPhone(data: PhoneForm) {
    setIsSubmitting(true);
    const formattedPhone = data.phone.startsWith('+') ? data.phone : `+1${data.phone}`;
    const { error } = await signInWithPhone(formattedPhone);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Failed to send code',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setPendingPhone(formattedPhone);
    setMode('signin-phone-otp');
    toast({
      title: 'Code sent',
      description: 'Check your phone for the verification code.',
    });
  }

  // Verify OTP for sign in
  async function handleSignInOtp(data: OtpForm) {
    setIsSubmitting(true);
    const { error } = await verifyPhoneOtp(pendingPhone, data.otp);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Verification failed',
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

  // Sign in with email
  async function handleSignInEmail(data: SignInEmailForm) {
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

    navigate('/');
  }

  // Add email+password to account
  async function handleAddEmailPassword(data: EmailPasswordForm) {
    setIsSubmitting(true);
    const { error } = await updateEmailPassword(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Failed to add email',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Email added!',
      description: 'Your account is now fully set up.',
    });
    await refreshProfile();
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

  // User is fully verified - show profile
  if (user && profile && profile.phone_verified && profile.email_verified) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="My Profile" showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <UserProfileCard profile={profile} />
        </main>
      </div>
    );
  }

  // User has verified phone but needs email (for contributions)
  if (user && profile && profile.phone_verified && !profile.email_verified && mode === 'add-email') {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Complete Setup" showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Phone verified</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                  setMode('phone-entry');
                  phoneForm.reset();
                  otpForm.reset();
                  setPendingPhone('');
                  navigate('/auth');
                }}
              >
                Sign out
              </Button>
            </div>

            <h1 className="font-display text-xl font-semibold mb-2">Add email & password</h1>
            <p className="text-muted-foreground text-sm mb-6">
              You're signed in with your phone. Add email + password to upload photos and contribute.
            </p>

            <form onSubmit={emailPasswordForm.handleSubmit(handleAddEmailPassword)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...emailPasswordForm.register('email')}
                  />
                </div>
                {emailPasswordForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {emailPasswordForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...emailPasswordForm.register('password')}
                  />
                </div>
                {emailPasswordForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {emailPasswordForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save & continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                Skip for now
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Sign in choice screen
  if (mode === 'signin-choice') {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Sign In" showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="font-display text-xl font-semibold mb-6">Welcome back</h1>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => setMode('signin-phone')}>
                <Phone className="w-4 h-4 mr-2" />
                Sign in with phone
              </Button>

              <Button variant="outline" className="w-full" onClick={() => setMode('signin-email')}>
                <Mail className="w-4 h-4 mr-2" />
                Sign in with email
              </Button>
            </div>

            <div className="mt-6 space-y-2 text-center">
              <Button variant="link" onClick={() => setMode('phone-entry')}>
                Don't have an account? Sign up with phone
              </Button>
              <Button variant="link" onClick={() => setMode('signup-email')}>
                Prefer email? Create an account with email
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Sign in with phone
  if (mode === 'signin-phone') {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Sign In" showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4 -ml-2"
              onClick={() => setMode('signin-choice')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <h1 className="font-display text-xl font-semibold mb-2">Sign in with phone</h1>
            <p className="text-muted-foreground text-sm mb-6">
              We'll send you a verification code.
            </p>

            <form onSubmit={phoneForm.handleSubmit(handleSignInPhone)} className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                    {...phoneForm.register('phone')}
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send code'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Sign in OTP verification
  if (mode === 'signin-phone-otp') {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Verify Code" showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="font-display text-xl font-semibold mb-2">Enter verification code</h1>
            <p className="text-muted-foreground text-sm mb-6">
              We sent a code to {pendingPhone}
            </p>

            <form onSubmit={otpForm.handleSubmit(handleSignInOtp)} className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  {...otpForm.register('otp')}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-destructive mt-1">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify & sign in'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode('signin-phone');
                  otpForm.reset();
                }}
              >
                Use a different number
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Create account with email
  if (mode === 'signup-email') {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Create Account" showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 -ml-2"
              onClick={() => setMode('signin-choice')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <h1 className="font-display text-xl font-semibold mb-2">Create account with email</h1>
            <p className="text-muted-foreground text-sm mb-6">
              You can create an account with email + password, or go back to sign up with phone.
            </p>

            <form
              onSubmit={emailPasswordForm.handleSubmit(async (data) => {
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

                toast({
                  title: 'Account created',
                  description: 'You can now sign in with your email and password.',
                });

                setMode('signin-email');
              })}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...emailPasswordForm.register('email')}
                  />
                </div>
                {emailPasswordForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {emailPasswordForm.formState.errors.email.message}
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
                    {...emailPasswordForm.register('password')}
                  />
                </div>
                {emailPasswordForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {emailPasswordForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create account'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Sign in with email
  if (mode === 'signin-email') {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Sign In" showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4 -ml-2"
              onClick={() => setMode('signin-choice')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <h1 className="font-display text-xl font-semibold mb-6">Sign in with email</h1>

            <form onSubmit={signInEmailForm.handleSubmit(handleSignInEmail)} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...signInEmailForm.register('email')}
                  />
                </div>
                {signInEmailForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {signInEmailForm.formState.errors.email.message}
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
                    {...signInEmailForm.register('password')}
                  />
                </div>
                {signInEmailForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {signInEmailForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Phone OTP verification (signup)
  if (mode === 'phone-otp') {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Verify Phone" showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="font-display text-xl font-semibold mb-2">Enter verification code</h1>
            <p className="text-muted-foreground text-sm mb-6">
              We sent a code to {pendingPhone}
            </p>

            <form onSubmit={otpForm.handleSubmit(handlePhoneOtp)} className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  {...otpForm.register('otp')}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-destructive mt-1">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify phone'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode('phone-entry');
                  otpForm.reset();
                }}
              >
                Use a different number
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Default: Phone entry (signup)
  return (
    <div className="min-h-screen bg-background">
      <Header title="Create Account" showBack />
      <main className="container px-4 py-8 max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-6">
          <h1 className="font-display text-xl font-semibold mb-2">Get started</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Enter your phone number to create an account. We'll send you a verification code.
          </p>

          <form onSubmit={phoneForm.handleSubmit(handlePhoneEntry)} className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                  {...phoneForm.register('phone')}
                />
              </div>
              {phoneForm.formState.errors.phone && (
                <p className="text-sm text-destructive mt-1">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send verification code'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => setMode('signin-choice')}>
              Already have an account? Sign in
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}