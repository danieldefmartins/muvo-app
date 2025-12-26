import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type TravelerType = 'rv_full_timer' | 'weekend_rver' | 'van_life' | 'tent_camper' | 'just_exploring';
export type ContributorLevel = 'new_contributor' | 'active_contributor' | 'verified_contributor' | 'trusted_explorer';

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
  // New identity fields
  username: string | null;
  full_name: string | null;
  traveler_type: TravelerType | null;
  home_base: string | null;
  contributor_level: ContributorLevel;
  profile_completed: boolean;
  created_at: string;
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

  // Check if username is available
  async function checkUsernameAvailable(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    
    return !error && !data;
  }

  // Complete profile after sign up
  async function completeProfile(data: {
    username: string;
    full_name: string;
    traveler_type?: TravelerType | null;
    home_base?: string | null;
  }) {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({
        username: data.username.toLowerCase(),
        full_name: data.full_name,
        display_name: data.full_name, // Set display_name to full_name for backwards compatibility
        traveler_type: data.traveler_type || null,
        home_base: data.home_base || null,
        profile_completed: true,
      })
      .eq('id', user.id);

    if (!error) {
      await fetchProfile(user.id);
    }

    return { error };
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

  // Check if profile needs to be completed
  const needsProfileCompletion = Boolean(user && profile && !profile.profile_completed);

  return {
    user,
    session,
    profile,
    loading,
    isVerified,
    needsProfileCompletion,
    // New methods
    checkUsernameAvailable,
    completeProfile,
    // Phone-first methods
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
