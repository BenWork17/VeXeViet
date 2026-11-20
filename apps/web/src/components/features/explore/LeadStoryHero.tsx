'use client';

import React, { useState } from 'react';
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
  getLeadDestination,
  type ExploreDestination,
} from '@/lib/data/explore-destinations';
import { Destination3DCameraModal } from './Destination3DCameraModal';

export interface LeadStoryHeroProps {
  destination?: ExploreDestination;
  article?: ExploreDestination;
  isSelected?: boolean;
  onToggleSelect?: (destinationId: string) => void;
  onReadArticle?: (destination: ExploreDestination) => void;
  onOpen3DCamera?: (destination: ExploreDestination) => void;
  selectedHighlightIds?: string[];
  onToggleHighlight?: (highlightId: string, destinationId?: string) => void;
  aiMatchPercentage?: number;
  aiMatchReasons?: string[];
}

const FALLBACK_HERO_IMG =
  'https://placehold.co/1200x800/faf9f7/c2410c?text=VeXeViet+Discovery';

export function LeadStoryHero({
  destination,
  article,
  isSelected = false,
  onToggleSelect,
  onReadArticle,
  onOpen3DCamera,
  selectedHighlightIds = [],
  onToggleHighlight,
  aiMatchPercentage,
  aiMatchReasons,
}: LeadStoryHeroProps) {
  const lead = destination ?? article ?? getLeadDestination();
  const [imgSrc, setImgSrc] = useState(lead.heroImage);
  const [fallback3DOpen, setFallback3DOpen] = useState(false);

  // Sync image if lead destination changes
  React.useEffect(() => {
    setImgSrc(lead.heroImage);
  }, [lead.heroImage]);

  const handleOpen3D = () => {
    if (onOpen3DCamera) {
      onOpen3DCamera(lead);
    } else {
      setFallback3DOpen(true);
    }
  };

  const searchUrl = buildSearchRouteUrl(lead);
  const travelUrl = buildTravelPlannerUrl(lead);

  return (
    <section
      aria-labelledby="lead-story-heading"
      className="w-full border-b-2 border-double border-border-strong bg-background py-7 lg:py-9"
    >
      <div className="mx-auto w-full max-w-[1520px] px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* Section Kicker Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded bg-primary px-2.5 py-0.5 font-mono text-[11px] font-extrabold uppercase tracking-widest text-primary-foreground">
              TRANG NHẤT • TIÊU ĐIỂM ĐẶC BIỆT
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {lead.editionNumber} • {lead.region} • {lead.category}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {lead.displayLocation}
            </span>
            <span aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {lead.readTimeMinutes} phút đọc
            </span>
            {aiMatchPercentage && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-accent px-2.5 py-0.5 font-sans text-xs font-bold text-accent-foreground">
                <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                AI Đề xuất {aiMatchPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Main 7:5 Newspaper Front-Page Grid */}
        <article className="grid gap-7 lg:grid-cols-12 lg:items-start lg:gap-9">
          {/* Left 7 Columns: Photojournalism Visual + Bus Connection Bar */}
          <div className="space-y-4 lg:col-span-7">
            <figure className="group relative m-0 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={imgSrc}
                  alt={lead.title}
                  onError={() => setImgSrc(FALLBACK_HERO_IMG)}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                {/* Top Overlay Badges + Quick 3D Camera Trigger */}
                <div className="absolute top-3.5 right-3.5 left-3.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1 text-xs font-bold text-foreground shadow-xs backdrop-blur-xs">
                    <Sun className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span>{lead.seasonalPulse}</span>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpen3D}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3.5 py-1 text-xs font-extrabold text-primary-foreground shadow-md transition-transform hover:scale-105 hover:bg-primary-deep"
                    >
                      <Orbit className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Street View 360°</span>
                    </button>
                    <span className="hidden items-center gap-1.5 rounded-full bg-card/95 px-3 py-1 font-mono text-[11px] font-bold text-foreground shadow-xs backdrop-blur-xs sm:inline-flex">
                      Mật độ: {lead.crowdLevel}
                    </span>
                  </div>
                </div>

                {/* Bottom Photo Caption Overlay */}
                <figcaption className="absolute right-4 bottom-3.5 left-4 flex flex-col gap-1 text-xs text-white/95 sm:flex-row sm:items-end sm:justify-between">
                  <p className="m-0 max-w-2xl leading-relaxed font-medium drop-shadow-xs">
                    <strong className="font-mono text-[10px] uppercase tracking-widest text-secondary">
                      ẢNH PHÓNG SỰ:{' '}
                    </strong>
                    {lead.heroImageCaption}
                  </p>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-white/80">
                    TỌA ĐỘ: {lead.coordinates[0].toFixed(2)}°N, {lead.coordinates[1].toFixed(2)}°E
                  </span>
                </figcaption>
              </div>
            </figure>

            {/* Newspaper Route Ticket & AI Field Note Strip */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                    <Bus className="h-3.5 w-3.5" aria-hidden="true" />
                    TUYẾN XE KHÁCH KẾT NỐI
                  </span>
                  <span className="rounded bg-surface-soft px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
                    {lead.busDurationLabel}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-bold text-foreground">
                  {lead.suggestedOrigin} → {lead.province}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {lead.recommendedBusType} • Giá vé từ{' '}
                  <strong className="font-mono font-bold text-primary">{lead.busPriceFormatted}</strong>
                </p>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-primary/25 bg-accent/60 p-4">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  GÓC NHÌN AI BIÊN TẬP
                </span>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed font-medium text-foreground">
                  {lead.aiInsight}
                </p>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Editorial Story Headline, Pull-Quote, Entertainment Checklist & CTAs */}
          <div className="flex flex-col justify-between space-y-5 lg:col-span-5 lg:border-l lg:border-border lg:pl-8">
            <div className="space-y-3.5">
              {/* Author & Dateline */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-bold text-foreground">Bài viết: {lead.author.name}</span>
                <span>({lead.author.role})</span>
                <span aria-hidden="true">•</span>
                <span className="font-mono text-[11px]">{lead.publishedAt}</span>
              </div>

              {/* Headline */}
              <h2
                id="lead-story-heading"
                className="text-2xl leading-[1.12] tracking-tight text-foreground sm:text-3xl xl:text-4xl"
              >
                <button
                  type="button"
                  onClick={() => onReadArticle?.(lead)}
                  className="text-left font-normal transition-colors hover:text-primary"
                >
                  {lead.title}
                </button>
              </h2>

              {/* Standfirst */}
              <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
                {lead.standfirst || lead.subtitle}
              </p>

              {/* First Paragraph Snippet with Drop-Cap */}
              {lead.storyParagraphs[0] && (
                <p className="line-clamp-4 text-sm leading-relaxed text-foreground first-letter:float-left first-letter:mr-2.5 first-letter:text-4xl first-letter:leading-none first-letter:font-bold first-letter:text-primary first-letter:[font-family:var(--font-display)]">
                  {lead.storyParagraphs[0]}
                </p>
              )}

              {/* Pull Quote */}
              <blockquote className="m-0 rounded-r-xl border-l-4 border-primary bg-accent/60 py-3 pr-4 pl-4 text-xs leading-relaxed italic text-foreground sm:text-sm">
                {lead.pullQuote}
              </blockquote>

              {/* AI Match Reasons if active */}
              {aiMatchReasons && aiMatchReasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {aiMatchReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground"
                    >
                      <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Entertainment Highlights Checklist */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-foreground">
                  TOP ĐIỂM VUI CHƠI GIẢI TRÍ (TÍCH CHỌN VÀO LỊCH TRÌNH)
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {lead.highlights.length} trải nghiệm
                </span>
              </div>

              <div className="space-y-2">
                {lead.highlights.slice(0, 3).map((hl) => {
                  const isHighlightChecked = selectedHighlightIds.includes(hl.id);
                  return (
                    <button
                      key={hl.id}
                      type="button"
                      onClick={() => onToggleHighlight?.(hl.id, lead.id)}
                      aria-pressed={isHighlightChecked}
                      className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left text-xs transition-all ${
                        isHighlightChecked
                          ? 'border-primary bg-accent/80 text-foreground'
                          : 'border-border bg-surface-soft/70 text-foreground hover:border-primary/40 hover:bg-card'
                      }`}
                    >
                      {isHighlightChecked ? (
                        <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      ) : (
                        <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-foreground">{hl.title}</span>
                          <span className="rounded bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                            {hl.estimatedCost}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                          {hl.duration} • Giờ vàng: {hl.goldenHour}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onReadArticle?.(lead)}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary-deep"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>Đọc bài viết chuyên sâu</span>
              </button>

              <button
                type="button"
                onClick={handleOpen3D}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-primary bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Orbit className="h-4 w-4" aria-hidden="true" />
                <span>Street View 360°</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSelect?.(lead.id)}
                aria-pressed={isSelected}
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${
                  isSelected
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-border-strong bg-card text-foreground hover:border-primary hover:bg-accent/60'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>Đã ghim</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>Ghim hành trình</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Conversion Links to /search and /travel */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs">
              <Link
                href={searchUrl}
                className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
              >
                <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đặt vé xe đi {lead.province} ({lead.busPriceFormatted})</span>
              </Link>
              <Link
                href={travelUrl}
                className="inline-flex items-center gap-1.5 font-bold text-muted-foreground transition-colors hover:text-primary"
              >
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Mở trên Bản đồ lộ trình (/travel)</span>
              </Link>
            </div>
          </div>
        </article>
      </div>

      {/* Standalone Fallback 3D Camera Modal if onOpen3DCamera prop is omitted */}
      {fallback3DOpen && (
        <Destination3DCameraModal
          destination={lead}
          isOpen={fallback3DOpen}
          onClose={() => setFallback3DOpen(false)}
          selectedHighlightIds={selectedHighlightIds}
          onToggleHighlight={onToggleHighlight}
        />
      )}
    </section>
  );
}
