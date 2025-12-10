"use client";

import React, { useEffect, useState } from 'react';
import Skeleton from '@/components/ui/skeleton';
import CmsAdBannerClient, { CmsAdBannerData } from './CmsAdBannerClient';

const CmsAdBanner: React.FC = () => {
  const [banner, setBanner] = useState<CmsAdBannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    fetch('/api/contentful/banner')
      .then(async (resp) => {
        if (!resp.ok) {
          throw new Error('Could not fetch banner');
        }
        return resp.json();
      })
      .then((json) => {
        if (!ignore) {
          setBanner(json?.data ?? null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message ?? 'Network error');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (loading)
    return (
      <div className="rounded-xl p-4 border bg-white shadow-sm min-h-[80px]">
        <Skeleton className="w-full h-28 rounded-xl" />
      </div>
    );

  if (error) return null;
  if (!banner) return null;

  return <CmsAdBannerClient banner={banner} />;
};

export default CmsAdBanner;
