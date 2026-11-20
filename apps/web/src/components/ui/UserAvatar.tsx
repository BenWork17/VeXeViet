'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/api/media';

interface UserAvatarProps {
  src?: string | null;
  /** Fallback text (initials) shown when there is no image or it fails to load. */
  fallback: string;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * Circular avatar with image + initials fallback. Resolves relative BE media paths.
 * Sizing/colour come from `className` (e.g. "h-20 w-20").
 */
export function UserAvatar({ src, fallback, alt = '', className, fallbackClassName }: UserAvatarProps) {
  const url = resolveMediaUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        className,
        !url || failed ? fallbackClassName : undefined
      )}
    >
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden={alt ? undefined : true}>{fallback}</span>
      )}
    </span>
  );
}
