'use client';

import { use } from 'react';
import SharedTreeView from '@/components/SharedTreeView';

export default function FamilySlugPage({ params }: { params: Promise<{ familySlug: string }> }) {
  const resolvedParams = use(params);
  return <SharedTreeView familySlug={resolvedParams.familySlug} />;
}

