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

  const handleSelectTree = async (treeId: string, treeName: string) => {
    try {
      const res = await fetch(`/api/trees/${treeId}`, {
        method: 'GET',
        credentials: 'include',
      });

      let loadedFamilyTree = [];
      let loadedFamilyName: string | undefined = treeName;

      if (res.ok) {
        const data = await res.json();
        loadedFamilyTree = Array.isArray(data.persons) ? data.persons : [];
        if (typeof data.name === 'string' && data.name.trim()) {
          loadedFamilyName = data.name;
        }
      }

      setAppState(prev => ({
        ...prev,
        currentTreeId: treeId,
        familyName: loadedFamilyName,
        familyTree: loadedFamilyTree,
      }));

      router.push('/dashboard');
    } catch (error) {
      // If API call fails, still navigate with minimal state so user isn't blocked
      console.error('Failed to load tree from API, continuing with empty tree:', error);
      setAppState(prev => ({
        ...prev,
        currentTreeId: treeId,
        familyName: treeName,
        familyTree: [],
      }));
      router.push('/dashboard');
    }
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

