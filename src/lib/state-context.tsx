'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Person {
  id: string;
  name: string;
  relation: string;
  birthYear?: string;
  deathYear?: string;
  gender: 'male' | 'female' | 'other';
  photo?: string;
  notes?: string;
  parentId?: string;
  spouseId?: string;
  generation: number;
  timeline?: Array<{ year: string; event: string }>;
  gallery?: string[];
  documents?: Array<{ name: string; type: string; url: string }>;
  
  // Detailed fields
  biography?: string;
  dateOfBirth?: string;
  birthPlace?: string;
  nakshatram?: string;
  moolaPadam?: string;
  rasi?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  complexion?: string;
  marriageDate?: string;
  education?: Array<{
    level: string;
    institution: string;
    year: string;
    status: string;
  }>;
  career?: Array<{
    title: string;
    company: string;
    period: string;
    achievements?: string;
  }>;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface AppState {
  user: { name: string; email: string } | null;
  familyTree: Person[];
  theme: 'classic' | 'modern' | 'colorful';
  rootPersonId?: string;
  familyName?: string;
  currentTreeId?: string;
}

interface AppStateContextType {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>(() => {
    if (typeof window === 'undefined') {
      return {
        user: null,
        familyTree: [],
        theme: 'modern',
      };
    }
    const saved = localStorage.getItem('parivaar-state');
    return saved ? JSON.parse(saved) : {
      user: null,
      familyTree: [],
      theme: 'modern',
    };
  });

  // Load tree data when currentTreeId changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (appState.currentTreeId) {
      const treeData = localStorage.getItem(`parivaar-tree-${appState.currentTreeId}`);
      if (treeData) {
        const parsed = JSON.parse(treeData);
        setAppState(prev => ({
          ...prev,
          familyTree: parsed.familyTree || [],
          familyName: parsed.familyName,
        }));
      }
    }
  }, [appState.currentTreeId]);

  // Save tree data separately
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (appState.currentTreeId && appState.familyTree.length >= 0) {
      localStorage.setItem(`parivaar-tree-${appState.currentTreeId}`, JSON.stringify({
        familyTree: appState.familyTree,
        familyName: appState.familyName,
      }));
      
      // Update tree metadata
      const trees = JSON.parse(localStorage.getItem('parivaar-trees') || '[]');
      const updatedTrees = trees.map((tree: any) => {
        if (tree.id === appState.currentTreeId) {
          return {
            ...tree,
            memberCount: appState.familyTree.length,
            lastModified: new Date().toISOString(),
          };
        }
        return tree;
      });
      localStorage.setItem('parivaar-trees', JSON.stringify(updatedTrees));
    }
  }, [appState.familyTree, appState.familyName, appState.currentTreeId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('parivaar-state', JSON.stringify(appState));
  }, [appState]);

  return (
    <AppStateContext.Provider value={{ appState, setAppState }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

