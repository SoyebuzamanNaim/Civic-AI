'use client';

import { createClient } from '@/shared/infrastructure/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RealtimeDashboardListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('realtime-reports')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
