'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FamilyTreesManager from '@/components/FamilyTreesManager';
import { useAppState } from '@/lib/state-context';

export default function TreesPage() {
  const router = useRouter();
  const { appState, setAppState } = useAppState();

  useEffect(() => {
    // Redirect if not authenticated
    if (!appState.user) {
      router.push('/onboarding');
    }
  }, [appState.user, router]);

  if (!appState.user) {
    return null;
  }

  const handleSelectTree = (treeId: string, treeName: string) => {
    setAppState(prev => ({
      ...prev,
      currentTreeId: treeId,
      familyName: treeName,
      familyTree: [],
    }));
    router.push('/dashboard');
  };

  const handleLogout = () => {
    setAppState({
      user: null,
      familyTree: [],
      theme: 'modern',
    });
    localStorage.removeItem('parivaar-state');
    localStorage.removeItem('parivaar_onboarded');
    router.push('/onboarding');
  };

  return (
    <FamilyTreesManager 
      userName={appState.user.name}
      onSelectTree={handleSelectTree}
      onLogout={handleLogout}
    />
  );
}

