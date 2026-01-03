import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    if (!user) return;

    // Real-time subscription for profile changes
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` },
        () => {
          fetchProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateWalletBalance = async (amount: number) => {
    if (!user || !profile) return false;

    try {
      const newBalance = (profile.wallet_balance || 0) + amount;
      
      if (newBalance < 0) {
        toast({
          title: 'Insufficient funds',
          description: 'You do not have enough wallet balance',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('user_id', user.id);

      if (error) throw error;
      
      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    profile,
    loading,
    updateWalletBalance,
    refetch: fetchProfile,
  };
};
