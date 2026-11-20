'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Bookmark,
  Bus,
  Check,
  CheckSquare,
  Clock,
  Compass,
  MapPin,
  Orbit,
  Sparkles,
  Square,
  Sun,
  Ticket,
} from 'lucide-react';
import {
  buildSearchRouteUrl,
  buildTravelPlannerUrl,
  type ExploreDestination,
  type ScoredExploreDestination,
} from '@/lib/data/explore-destinations';

export interface EditorialArticleCardProps {
  destination: ExploreDestination | ScoredExploreDestination;
  article?: ExploreDestination | ScoredExploreDestination;
  isSelected?: boolean;
  onToggleSelect?: (destinationId: string) => void;
  onReadArticle?: (destination: ExploreDestination) => void;
  onOpen3DCamera?: (destination: ExploreDestination) => void;
  selectedHighlightIds?: string[];
  onToggleHighlight?: (highlightId: string, destinationId?: string) => void;
  featured?: boolean;
  showAiMatchBadge?: boolean;
}

const FALLBACK_CARD_IMG =
  'https://placehold.co/800x520/faf9f7/c2410c?text=VeXeViet+Discovery';

function isScoredDestination(
  dest: ExploreDestination | ScoredExploreDestination,
): dest is ScoredExploreDestination {
  return 'matchPercentage' in dest && typeof dest.matchPercentage === 'number';
}

export function EditorialArticleCard({
  destination: propDestination,
  article,
  isSelected = false,
  onToggleSelect,
  onReadArticle,
  onOpen3DCamera,
  selectedHighlightIds = [],
  onToggleHighlight,
  featured = false,
  showAiMatchBadge = false,
}: EditorialArticleCardProps) {
  const destination = propDestination ?? article!;
  const [imgSrc, setImgSrc] = useState(destination.heroImage);

  useEffect(() => {
    setImgSrc(destination.heroImage);
  }, [destination.heroImage]);

  const scored = isScoredDestination(destination) ? destination : null;
  const searchUrl = buildSearchRouteUrl(destination);
  const travelUrl = buildTravelPlannerUrl(destination);

  const selectedActivitiesInThisCard = destination.highlights.filter((h) =>
    selectedHighlightIds.includes(h.id),
  ).length;

  return (
    <article
      className={`group flex h-full flex-col justify-between rounded-2xl border transition-all duration-300 ${
        isSelected
          ? 'border-primary bg-card shadow-md'
          : 'border-border bg-card shadow-2xs hover:border-primary/45 hover:shadow-sm'
      } ${featured ? 'p-5 sm:p-6' : 'p-4 sm:p-5'}`}
    >
      <div className="space-y-4">
        {/* Newspaper Column Header / Kicker */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-primary">
              {destination.category}
            </span>
            <span className="text-border-strong" aria-hidden="true">
              •
            </span>
            <span className="font-mono text-[11px] font-semibold text-muted-foreground">
              {destination.region}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" aria-hidden="true" />
              {destination.readTimeMinutes}p
            </span>
            {(showAiMatchBadge || (scored && scored.matchPercentage >= 80)) && scored && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-accent px-2 py-0.5 font-sans text-[11px] font-bold text-accent-foreground">
                <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                {scored.matchPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Photojournalism Thumbnail */}
        <figure className="relative m-0 overflow-hidden rounded-xl border border-border bg-muted">
          <div className={`relative w-full overflow-hidden ${featured ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
            <img
              src={imgSrc}
              alt={destination.title}
              loading="lazy"
              onError={() => setImgSrc(FALLBACK_CARD_IMG)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-0.5 text-[11px] font-bold text-foreground shadow-2xs backdrop-blur-xs">
                <MapPin className="h-3 w-3 text-primary" aria-hidden="true" />
                {destination.displayLocation}
              </span>

              <button
                type="button"
                onClick={() => onOpen3DCamera?.(destination)}
                aria-label={`Mở Street View 360° tại ${destination.displayLocation}`}
                className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary px-2.5 py-0.5 text-[11px] font-extrabold text-primary-foreground shadow-sm transition-transform hover:scale-105 hover:bg-primary-deep"
              >
                <Orbit className="h-3 w-3" aria-hidden="true" />
                <span>Street View 360°</span>
              </button>
            </div>

            {/* Bottom Seasonal Pulse Badge */}
            <div className="absolute right-2.5 bottom-2.5 left-2.5 flex items-center justify-between gap-2 text-[11px] text-white">
              <span className="inline-flex items-center gap-1 font-medium drop-shadow-xs">
                <Sun className="h-3 w-3 text-secondary" aria-hidden="true" />
                <span className="line-clamp-1">{destination.seasonalPulse}</span>
              </span>
              <span className="shrink-0 rounded bg-black/65 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-xs">
                {destination.estimatedBudgetFormatted}
              </span>
            </div>
          </div>
        </figure>

        {/* Headline & Standfirst */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-muted-foreground">
            <span>{destination.editionNumber}</span>
            <span>Mùa đẹp: {destination.bestMonths}</span>
          </div>

          <h3
            className={`leading-[1.18] tracking-tight text-foreground ${
              featured ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
            }`}
          >
            <button
              type="button"
              onClick={() => onReadArticle?.(destination)}
              className="text-left font-normal transition-colors hover:text-primary"
            >
              {destination.title}
            </button>
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {destination.standfirst || destination.subtitle}
          </p>
        </div>

        {/* AI Match Reasons if present */}
        {scored && scored.matchReasons && scored.matchReasons.length > 0 && showAiMatchBadge && (
          <div className="flex flex-wrap gap-1.5">
            {scored.matchReasons.slice(0, 2).map((reason, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-accent/70 px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
              >
                <Sparkles className="h-2.5 w-2.5 text-primary" aria-hidden="true" />
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Pull Quote Snippet */}
        <blockquote className="m-0 border-l-2 border-primary pl-3 text-xs leading-relaxed italic text-muted-foreground">
          <span className="line-clamp-2">{destination.pullQuote}</span>
        </blockquote>

        {/* Interactive Entertainment Highlights Checklist */}
        <div className="rounded-xl border border-border bg-surface-soft/75 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-foreground">
              TOP ĐIỂM VUI CHƠI GIẢI TRÍ (TÍCH CHỌN)
            </span>
            {selectedActivitiesInThisCard > 0 ? (
              <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
                Đã chọn {selectedActivitiesInThisCard}
              </span>
            ) : (
              <span className="font-mono text-[10px] text-muted-foreground">
                {destination.highlights.length} điểm
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {destination.highlights.slice(0, 3).map((hl) => {
              const checked = selectedHighlightIds.includes(hl.id);
              return (
                <button
                  key={hl.id}
                  type="button"
                  onClick={() => onToggleHighlight?.(hl.id, destination.id)}
                  aria-pressed={checked}
                  className={`flex w-full items-start gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-all ${
                    checked
                      ? 'border-primary bg-accent text-foreground'
                      : 'border-border/80 bg-card text-foreground hover:border-primary/40'
                  }`}
                >
                  {checked ? (
                    <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  ) : (
                    <Square className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="line-clamp-1 font-semibold text-foreground">{hl.title}</span>
                      <span className="shrink-0 font-mono text-[10px] font-bold text-primary">
                        {hl.estimatedCost}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-[10px] text-muted-foreground">
                      {hl.category} • {hl.duration} • Giờ vàng: {hl.goldenHour}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer: Bus Route Info + Read, 3D Cam & Clip CTAs */}
      <div className="mt-4 space-y-3 border-t border-border pt-3.5">
        {/* Bus Ticket Stub */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-soft px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Bus className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>
              {destination.suggestedOrigin} → {destination.province}
            </span>
            <span className="text-muted-foreground">({destination.busDurationLabel})</span>
          </div>
          <span className="font-mono text-xs font-extrabold text-primary">
            Từ {destination.busPriceFormatted}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReadArticle?.(destination)}
            className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-card px-2.5 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
          >
            <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Đọc bài</span>
          </button>

          <button
            type="button"
            onClick={() => onOpen3DCamera?.(destination)}
            className="inline-flex min-h-[38px] items-center justify-center gap-1 rounded-xl border border-primary/40 bg-surface-soft px-2.5 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
            title={`Xem Street View 360° tại ${destination.displayLocation}`}
          >
            <Orbit className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Cam 360°</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSelect?.(destination.id)}
            aria-pressed={isSelected}
            className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
              isSelected
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'border border-primary/40 bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đã ghim</span>
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ghim</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Route & Map Links */}
        <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px]">
          <Link
            href={searchUrl}
            className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
          >
            <Ticket className="h-3 w-3" aria-hidden="true" />
            <span>Tìm chuyến xe</span>
          </Link>
          <Link
            href={travelUrl}
            className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-primary"
          >
            <Compass className="h-3 w-3" aria-hidden="true" />
            <span>Mở bản đồ lộ trình</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
