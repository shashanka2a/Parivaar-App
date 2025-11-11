'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useAppState } from '@/lib/state-context';

export default function OnboardingPage() {
  const router = useRouter();
  const { appState, setAppState } = useAppState();

  useEffect(() => {
    // Redirect if already authenticated
    if (appState.user) {
      router.push('/trees');
    }
  }, [appState.user, router]);

  if (appState.user) {
    return null;
  }

  return <OnboardingFlow setAppState={setAppState} />;
}

