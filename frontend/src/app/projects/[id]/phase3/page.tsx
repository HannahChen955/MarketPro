'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Phase3Redirect() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  useEffect(() => {
    if (projectId) {
      router.replace(`/projects/${projectId}/phase-3`);
    }
  }, [projectId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在跳转到第三阶段...</p>
      </div>
    </div>
  );
}