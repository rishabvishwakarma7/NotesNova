'use client';
/**
 * useAuthApi — call once in a high-level layout component.
 * Registers a token provider for the shared `api` axios instance
 * using Clerk's useAuth() hook (which is always ready inside ClerkProvider).
 */
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { setTokenProvider } from '@/services/api';

export function useAuthApi() {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    setTokenProvider(() => getToken());
    return () => setTokenProvider(null);
  }, [isLoaded, getToken]);
}
