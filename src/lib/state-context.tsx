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

// Strip large/binary fields before saving to localStorage to avoid quota issues
function serializePersonForStorage(person: Person) {
  // We intentionally drop photo/gallery/documents from localStorage snapshots.
  // These can be re-hydrated from the backend later if needed.
  // Keeping them in localStorage (base64) quickly exceeds browser quota.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { photo, gallery, documents, ...rest } = person;
  return rest;
}

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          user: parsed.user ?? null,
          theme: parsed.theme ?? 'modern',
          familyTree: parsed.familyTree ?? [],
          rootPersonId: parsed.rootPersonId,
          familyName: parsed.familyName,
          currentTreeId: parsed.currentTreeId,
        };
      } catch {
        // Fallback to a safe default if parsing fails
        return {
          user: null,
          familyTree: [],
          theme: 'modern',
        };
      }
    }
    return {
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Avoid storing full familyTree (with photos) in the global snapshot.
    // Tree data is already stored in `parivaar-tree-*`.
    const { familyTree, ...rest } = appState;
    localStorage.setItem('parivaar-state', JSON.stringify(rest));
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

