'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasOnboarded = localStorage.getItem('parivaar_onboarded');
    
    const timer = setTimeout(() => {
      if (hasOnboarded === 'true') {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return <LoadingScreen />;
}

