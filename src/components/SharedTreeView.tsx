'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TreePine, Home } from 'lucide-react';
import { Button } from './ui/button';
import { AppState } from '@/lib/state-context';
import FamilyCanvas from './FamilyCanvas';
import { toast } from 'sonner';
import LoadingOverlay from './LoadingOverlay';

interface SharedTreeViewProps {
  shareId?: string;
  familySlug?: string;
}

export default function SharedTreeView({ shareId, familySlug }: SharedTreeViewProps = {}) {
  const router = useRouter();
  const [sharedData, setSharedData] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const identifier = shareId || familySlug;
    if (!identifier) return;

    const loadSharedTree = async () => {
      try {
        const res = await fetch(`/api/shares/${identifier}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Shared family tree not found');
        }

        const data = await res.json();
        const tree = data.familyTree;

        setSharedData({
          user: null,
          familyTree: tree.persons || [],
          theme: (tree.theme as any) || 'modern',
          familyName: tree.name,
          currentTreeId: tree.id,
        });
      } catch (err: any) {
        console.error('Failed to load shared tree:', err);
        toast.error(err.message || 'Failed to load shared family tree');
      } finally {
        setLoading(false);
      }
    };

    loadSharedTree();
  }, [shareId, familySlug]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <LoadingOverlay show message="Loading shared family tree..." />
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <TreePine className="size-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl mb-2">Family Tree Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This shared link may have expired or is invalid.
          </p>
          <Button onClick={() => router.push('/')} className="bg-[#22C55E] hover:bg-[#16A34A]">
            <Home className="size-4 mr-2" />
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <TreePine className="size-6 text-[#22C55E]" />
          <div>
            <h1 className="text-lg md:text-xl">Parivaar</h1>
            <p className="text-xs text-muted-foreground">
              Shared Family Tree
            </p>
          </div>
        </div>

        {/* Center Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center hidden md:block">
          <h2 className="text-xl" style={{ fontWeight: 600 }}>
            {sharedData.familyName || 'Family'}'s Family Tree
          </h2>
          <p className="text-sm text-muted-foreground">View-only mode</p>
        </div>

        <Button onClick={() => router.push('/')} variant="outline" size="sm">
          <Home className="size-4 mr-2" />
          Home
        </Button>
      </header>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <FamilyCanvas
          familyTree={sharedData.familyTree}
          theme={sharedData.theme}
          onNodeClick={() => {}}
          onEditPerson={() => {}}
          familyName={sharedData.familyName || sharedData.user?.name?.split(' ')[0] || 'Family'}
        />
      </div>
    </div>
  );
}