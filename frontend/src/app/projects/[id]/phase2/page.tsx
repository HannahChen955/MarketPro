'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Phase2Redirect() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  useEffect(() => {
    if (projectId) {
      router.replace(`/projects/${projectId}/phase-2`);
    }
  }, [projectId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在跳转到第二阶段...</p>
      </div>
    </div>
  );
}