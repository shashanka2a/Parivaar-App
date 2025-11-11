'use client';

import { use } from 'react';
import SharedTreeView from '@/components/SharedTreeView';

export default function SharedTreePage({ params }: { params: Promise<{ shareId: string }> }) {
  const resolvedParams = use(params);
  return <SharedTreeView shareId={resolvedParams.shareId} />;
}

