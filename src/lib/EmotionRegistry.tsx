'use client';

import * as React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// This implementation is from emotion-js
// https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => {
    const cache = createCache({ key: 'mui-style' });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const inserted = cache.inserted;
    const names = Object.keys(inserted);
    
    if (names.length === 0) {
      return null;
    }

    let styles = '';
    let dataEmotionAttribute = cache.key;

    names.forEach((name) => {
      const value = inserted[name];
      if (typeof value === 'string') {
        dataEmotionAttribute += ` ${name}`;
        styles += value;
      }
    });

    return (
      <style
        key={cache.key}
        data-emotion={dataEmotionAttribute}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
