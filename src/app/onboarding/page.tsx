'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useAppState } from '@/lib/state-context';

export default function OnboardingPage() {
  const router = useRouter();
  const { appState, setAppState } = useAppState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect if already authenticated (only after mount)
    if (mounted && appState.user) {
      router.push('/trees');
    }
  }, [appState.user, router, mounted]);

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#5A6B57]">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (appState.user) {
    return null;
  }

  return <OnboardingFlow setAppState={setAppState} />;
}

