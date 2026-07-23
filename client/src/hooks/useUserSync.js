'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import api from '@/services/api';

export function useUserSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || hasSynced.current) return;

    const syncUser = async () => {
      try {
        await api.post('/users/sync', {
          clerkId: user.id,
          name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          email: user.primaryEmailAddress?.emailAddress || '',
          profileImage: user.imageUrl || '',
        });
        hasSynced.current = true;
        console.log('✅ User synced to database');
      } catch (err) {
        console.error('Failed to sync user:', err.message);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user]);

  return { user, isLoaded, isSignedIn };
}
