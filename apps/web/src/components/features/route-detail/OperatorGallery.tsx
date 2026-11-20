'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type GalleryTab = 'interior' | 'exterior';

interface OperatorGalleryProps {
  operatorName: string;
  interiorImages?: string[];
  exteriorImages?: string[];
}

const TAB_LABELS: Record<GalleryTab, string> = {
  interior: 'Nội thất',
  exterior: 'Ngoại thất',
};

/**
 * Customer-facing gallery of an operator's vehicle photos with
 * "Nội thất" / "Ngoại thất" tabs, thumbnails and a keyboard-accessible lightbox.
 */
export function OperatorGallery({ operatorName, interiorImages = [], exteriorImages = [] }: OperatorGalleryProps) {
  const images: Record<GalleryTab, string[]> = { interior: interiorImages, exterior: exteriorImages };
  const [tab, setTab] = useState<GalleryTab>(interiorImages.length > 0 || exteriorImages.length === 0 ? 'interior' : 'exterior');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const list = images[tab];

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (delta: number) => setLightbox((i) => (i === null || list.length === 0 ? i : (i + delta + list.length) % list.length)),
    [list.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, close, step]);

  return (
    <div>
      <div role="tablist" aria-label="Ảnh xe" className="mb-4 inline-flex rounded-md border border-border bg-muted p-1">
        {(Object.keys(TAB_LABELS) as GalleryTab[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => {
              setTab(key);
              setLightbox(null);
            }}
            className={cn(
              'rounded-sm px-4 py-1.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              tab === key ? 'bg-card text-foreground shadow-hn-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {TAB_LABELS[key]}
            <span className="ml-1.5 text-xs font-medium text-muted-foreground">({images[key].length})</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-background py-10 text-center">
          <ImageOff className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Nhà xe chưa cập nhật ảnh {TAB_LABELS[tab].toLowerCase()}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {list.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightbox(index)}
              aria-label={`Xem ảnh ${TAB_LABELS[tab].toLowerCase()} ${index + 1}`}
              className={cn(
                'group relative overflow-hidden rounded-md border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                index === 0 ? 'col-span-2 row-span-2 aspect-[4/3] md:col-span-2' : 'aspect-[4/3]'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${operatorName} - ảnh ${TAB_LABELS[tab].toLowerCase()} ${index + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox !== null && list[lightbox] ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ảnh ${TAB_LABELS[tab].toLowerCase()} của ${operatorName}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" />
          </button>
          {list.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Ảnh trước"
                className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Ảnh sau"
                className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={list[lightbox]}
            alt={`${operatorName} - ảnh ${TAB_LABELS[tab].toLowerCase()} ${lightbox + 1}`}
            className="max-h-[85vh] max-w-full rounded-md object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 text-sm text-white/80">
            {lightbox + 1} / {list.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
