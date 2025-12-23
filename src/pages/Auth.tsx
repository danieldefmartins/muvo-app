import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { UserProfileCard } from '@/components/UserProfileCard';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // Treat empty string as "not provided" so validation doesn't block sign-up
  phone: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().min(10, 'Enter a valid phone number').optional()
  ),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const phoneSchema = z.object({
  phone: z.string().min(10, 'Enter a valid phone number'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit code'),
});

type SignUpForm = z.infer<typeof signUpSchema>;
type SignInForm = z.infer<typeof signInSchema>;
type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;

type AuthMode = 'signin' | 'signup' | 'verify-phone' | 'verify-otp';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading, signUp, signIn, verifyPhone, verifyPhoneOtp, resendEmailConfirmation } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  });

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  // Redirect if fully verified - but show profile if they want to see it
  useEffect(() => {
    if (!loading && user && profile?.is_verified && mode === 'signin') {
      // Don't auto-redirect, show profile instead
    }
  }, [user, profile, loading, navigate, mode]);

  // If logged in but not verified, show verification steps
  useEffect(() => {
    if (user && profile) {
      if (!profile.email_verified) {
        // Email not verified - show message
        setMode('signin');
      } else if (!profile.phone_verified) {
        // Email verified, phone not verified
        setMode('verify-phone');
      }
    }
  }, [user, profile]);

  async function handleSignUp(data: SignUpForm) {
    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password, data.phone);
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
      title: 'Check your email',
      description: 'We sent you a confirmation link. Click it to verify your account.',
    });
  }

  async function handleSignIn(data: SignInForm) {
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
  }

  async function handleSendPhoneOtp(data: PhoneForm) {
    setIsSubmitting(true);
    const formattedPhone = data.phone.startsWith('+') ? data.phone : `+1${data.phone}`;
    const { error } = await verifyPhone(formattedPhone);
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
    setMode('verify-otp');
    toast({
      title: 'Code sent',
      description: 'Check your phone for the verification code.',
    });
  }

  async function handleVerifyOtp(data: OtpForm) {
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
      description: 'Your account is now fully verified.',
    });
    navigate('/');
  }

  async function handleResendEmail() {
    const { error } = await resendEmailConfirmation();
    if (error) {
      toast({
        title: 'Failed to resend',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Email sent',
        description: 'Check your inbox for the confirmation link.',
      });
    }
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
  if (user && profile && profile.is_verified) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="My Profile" showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <UserProfileCard profile={profile} />
        </main>
      </div>
    );
  }

  // User is logged in but email not verified
  if (user && profile && !profile.email_verified) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Verify Email" showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
            <h1 className="font-display text-xl font-semibold mb-2">Check your email</h1>
            <p className="text-muted-foreground mb-4">
              We sent a confirmation link to <strong>{user.email}</strong>. 
              Click the link to verify your account.
            </p>
            <Button variant="outline" onClick={handleResendEmail}>
              Resend confirmation email
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // User is logged in, email verified, but phone not verified
  if (user && profile && profile.email_verified && !profile.phone_verified) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Verify Phone" showBack />
        <main className="container px-4 py-8 max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 text-success mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Email verified</span>
            </div>
            
            <h1 className="font-display text-xl font-semibold mb-2">Verify your phone</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              To upload photos and contribute, please verify your phone number.
            </p>

            {mode === 'verify-phone' ? (
              <form onSubmit={phoneForm.handleSubmit(handleSendPhoneOtp)} className="space-y-4">
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
            ) : (
              <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
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
                  onClick={() => setMode('verify-phone')}
                >
                  Use a different number
                </Button>
              </form>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Not logged in - show sign in/sign up
  return (
    <div className="min-h-screen bg-background">
      <Header title={mode === 'signin' ? 'Sign In' : 'Create Account'} showBack />
      <main className="container px-4 py-8 max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-6">
          {mode === 'signin' ? (
            <>
              <h1 className="font-display text-xl font-semibold mb-6">Welcome back</h1>
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
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
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => setMode('signup')}>
                  Don't have an account? Sign up
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-xl font-semibold mb-2">Create your account</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Verified accounts can upload photos and contribute updates.
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
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => setMode('signin')}>
                  Already have an account? Sign in
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
