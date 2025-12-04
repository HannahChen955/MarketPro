'use client';

import { useParams } from 'next/navigation';
import PhasePageTemplate from '@/components/PhasePageTemplate';

export default function Phase4Page() {
  const params = useParams();
  const projectId = params?.id as string;

  return <PhasePageTemplate projectId={projectId} phaseId="phase4" />;
}