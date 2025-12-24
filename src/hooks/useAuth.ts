import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  email: string | null;
  phone_number: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  phone_verified: boolean;
  phone_verified_at: string | null;
  is_verified: boolean;
  display_name: string | null;
  contribution_score: number;
  is_pro: boolean;
  total_reviews_count: number;
  trust_score: number;
  reviewer_medal: 'none' | 'bronze' | 'silver' | 'gold';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
    }
  }

  // Sign in / Sign up with phone (sends OTP)
  async function signInWithPhone(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { data, error };
  }

  // Verify phone OTP (works for both signup and signin)
  async function verifyPhoneOtp(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    
    if (!error && data.user) {
      // Update profile to mark phone as verified
      await supabase
        .from('profiles')
        .update({ 
          phone_verified: true, 
          phone_number: phone,
          phone_verified_at: new Date().toISOString()
        })
        .eq('id', data.user.id);
      
      // Refresh profile
      await fetchProfile(data.user.id);
    }
    
    return { data, error };
  }

  // Sign in with email+password
  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  // Update user's email and password (for phone-first users adding email)
  async function updateEmailPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
    });

    if (!error && user) {
      // Update profile to mark email as verified (since they're logged in)
      await supabase
        .from('profiles')
        .update({ 
          email,
          email_verified: true,
          email_verified_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      await fetchProfile(user.id);
    }

    return { data, error };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  // Legacy methods for backwards compatibility
  async function signUp(email: string, password: string, phone?: string) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      phone,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });

    return { data, error };
  }

  async function signIn(email: string, password: string) {
    return signInWithEmail(email, password);
  }

  async function verifyPhone(phone: string) {
    return signInWithPhone(phone);
  }

  async function resendEmailConfirmation() {
    if (!user?.email) return { error: new Error('No email found') };
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      }
    });
    
    return { error };
  }

  // Treat a user as "verified" if their auth email is confirmed OR their profile flags are set.
  // This prevents false negatives when profile verification fields lag behind auth state.
  const authEmailVerified = Boolean((user as any)?.email_confirmed_at);
  const authPhoneVerified = Boolean((user as any)?.phone_confirmed_at);

  const isVerified = Boolean(
    authEmailVerified ||
      authPhoneVerified ||
      profile?.email_verified ||
      profile?.phone_verified ||
      profile?.is_verified
  );

  return {
    user,
    session,
    profile,
    loading,
    isVerified,
    // New phone-first methods
    signInWithPhone,
    verifyPhoneOtp,
    signInWithEmail,
    updateEmailPassword,
    // Legacy methods
    signUp,
    signIn,
    signOut,
    verifyPhone,
    resendEmailConfirmation,
    refreshProfile: () => user && fetchProfile(user.id),
  };
}