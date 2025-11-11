'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExplorePage from '@/components/ExplorePage';
import { useAppState } from '@/lib/state-context';

export default function ExplorePageRoute() {
  const router = useRouter();
  const { appState } = useAppState();

  useEffect(() => {
    // Redirect if not authenticated or no tree selected
    if (!appState.user) {
      router.push('/onboarding');
    } else if (!appState.currentTreeId || !appState.familyName) {
      router.push('/trees');
    }
  }, [appState.user, appState.currentTreeId, appState.familyName, router]);

  if (!appState.user || !appState.currentTreeId || !appState.familyName) {
    return null;
  }

  return <ExplorePage appState={appState} />;
}

