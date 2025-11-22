'use client';

import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import { useState } from 'react';
import createCache from '@emotion/cache';

export default function EmotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cache] = useState(() => {
    const cache = createCache({ key: 'css' });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const names = cache.inserted;
    const styles = Object.keys(names).map((name) => names[name]);
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${Object.keys(names).join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles.join(' '),
        }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}