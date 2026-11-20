'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AudioLines,
  BookOpen,
  Bookmark,
  Bus,
  Check,
  CheckSquare,
  Clock,
  Compass,
  MapPin,
  Orbit,
  Play,
  Sparkles,
  Square,
  Sun,
  Ticket,
  Utensils,
  Volume2,
  X,
} from 'lucide-react';
import {
  buildSearchRouteUrl,
  buildTravelPlannerUrl,
  formatVndCurrency,
  type ExploreDestination,
} from '@/lib/data/explore-destinations';
import { Destination3DCameraView } from './Destination3DCameraModal';

export interface DestinationArticleModalProps {
  destination: ExploreDestination | null;
  article?: ExploreDestination | null;
  isOpen?: boolean;
  onClose: () => void;
  isSelected?: boolean;
  onToggleSelect?: (destinationId: string) => void;
  selectedHighlightIds?: string[];
  onToggleHighlight?: (highlightId: string, destinationId?: string) => void;
  initialTab?: 'article' | 'camera-3d';
  onOpen3DCamera?: (destination: ExploreDestination) => void;
}

const FALLBACK_MODAL_IMG =
  'https://placehold.co/1200x750/faf9f7/c2410c?text=VeXeViet+Discovery';

export function DestinationArticleModal({
  destination: propDestination,
  article,
  isOpen = true,
  onClose,
  isSelected = false,
  onToggleSelect,
  selectedHighlightIds = [],
  onToggleHighlight,
  initialTab = 'article',
}: DestinationArticleModalProps) {
  const activeDestination = propDestination ?? article ?? null;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'article' | 'camera-3d'>(initialTab);

  useEffect(() => {
    setActiveImageIndex(0);
    setIsPlayingAudio(false);
    setActiveTab(initialTab);
  }, [activeDestination?.id, initialTab]);

  useEffect(() => {
    if (!activeDestination || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDestination, isOpen, onClose]);

  if (!activeDestination || !isOpen) return null;

  const allImages = Array.from(
    new Set([activeDestination.heroImage, ...(activeDestination.gallery || [])]),
  );
  const currentImage = allImages[activeImageIndex] || activeDestination.heroImage;

  const searchUrl = buildSearchRouteUrl(activeDestination);
  const travelUrl = buildTravelPlannerUrl(activeDestination);

  const checkedHighlights = activeDestination.highlights.filter((h) =>
    selectedHighlightIds.includes(h.id),
  );
  const checkedActivitiesCost = checkedHighlights.reduce(
    (sum, h) => sum + h.estimatedCostVnd,
    0,
  );

  const handleSelectAllHighlights = () => {
    if (!onToggleHighlight) return;
    const allChecked =
      checkedHighlights.length === activeDestination.highlights.length;
    activeDestination.highlights.forEach((hl) => {
      const isCurrentlyChecked = selectedHighlightIds.includes(hl.id);
      if (allChecked && isCurrentlyChecked) {
        onToggleHighlight(hl.id, activeDestination.id);
      } else if (!allChecked && !isCurrentlyChecked) {
        onToggleHighlight(hl.id, activeDestination.id);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/65 p-3 backdrop-blur-xs sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-article-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="hn-sheet-up relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border-strong bg-background text-foreground shadow-xl">
        {/* Sticky Top Newspaper Edition Bar + Tab Switcher (Bài báo vs Góc Cam 3D) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-double border-border-strong bg-card px-5 py-3.5 sm:px-7">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-primary px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground">
              {activeDestination.editionNumber}
            </span>
            <div
              className="inline-flex rounded-xl border border-border bg-surface-soft p-0.5"
              role="tablist"
              aria-label="Chuyển chế độ đọc bài viết hoặc xem Góc Cam 3D"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'article'}
                onClick={() => setActiveTab('article')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  activeTab === 'article'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Bài báo chuyên sâu</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'camera-3d'}
                onClick={() => setActiveTab('camera-3d')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  activeTab === 'camera-3d'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Orbit className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Street View 360°</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSelect?.(activeDestination.id)}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-primary/40 bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Đã ghim hành trình</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Ghim vào sổ tay</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bài viết"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-soft text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable Body: Switches between Editorial Article and Embedded 3D Camera Viewfinder */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-8">
          {activeTab === 'camera-3d' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-primary">
                    TRẢI NGHIỆM NHÌN XUNG QUANH 360° • {activeDestination.displayLocation}
                  </span>
                  <h2 id="modal-article-title" className="text-xl text-foreground sm:text-2xl">
                    Street View 360° & Flycam Thực Tế Tại Điểm Đến
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('article')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-strong bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:border-primary hover:text-primary"
                >
                  <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span>Quay lại đọc bài báo</span>
                </button>
              </div>

              <Destination3DCameraView
                destination={activeDestination}
                selectedHighlightIds={selectedHighlightIds}
                onToggleHighlight={onToggleHighlight}
                isEmbedded={true}
              />
            </div>
          ) : (
            <>
              {/* Article Headline & Metadata Header */}
              <div className="space-y-3 border-b border-border pb-5">
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    {activeDestination.region} • Tỉnh {activeDestination.province}
                  </span>
                  <span aria-hidden="true">|</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    {activeDestination.readTimeMinutes} phút đọc chuyên sâu
                  </span>
                  <span aria-hidden="true">|</span>
                  <span>
                    Tọa độ: {activeDestination.coordinates[0].toFixed(2)}°N,{' '}
                    {activeDestination.coordinates[1].toFixed(2)}°E
                  </span>
                </div>

                <h2
                  id="modal-article-title"
                  className="text-2xl leading-[1.12] tracking-tight text-foreground sm:text-3xl lg:text-4xl"
                >
                  {activeDestination.title}
                </h2>

                <p className="text-base leading-relaxed font-medium text-muted-foreground sm:text-lg">
                  {activeDestination.standfirst || activeDestination.subtitle}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
                  <div>
                    Ký sự bởi{' '}
                    <strong className="font-bold text-foreground">
                      {activeDestination.author.name}
                    </strong>{' '}
                    ({activeDestination.author.role}) • {activeDestination.publishedAt}
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 font-mono text-[11px] font-semibold text-foreground">
                    <Sun className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    Mùa đẹp nhất: {activeDestination.bestMonths}
                  </span>
                </div>
              </div>

              {/* Photojournalism Hero & Gallery Switcher */}
              <div className="space-y-2.5">
                <figure className="relative m-0 overflow-hidden rounded-2xl border border-border bg-muted">
                  <div className="relative aspect-[16/9] w-full">
                    <img
                      src={currentImage}
                      alt={activeDestination.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_MODAL_IMG;
                      }}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveTab('camera-3d')}
                      className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3.5 py-1.5 text-xs font-extrabold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary-deep"
                    >
                      <Orbit className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Mở Street View 360° • Nhìn xung quanh</span>
                    </button>
                  </div>
                  <figcaption className="border-t border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
                    <strong className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      CHÚ THÍCH ẢNH:{' '}
                    </strong>
                    {activeDestination.heroImageCaption}
                  </figcaption>
                </figure>

                {allImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {allImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          activeImageIndex === idx
                            ? 'border-primary shadow-2xs'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Ảnh góc nhìn ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Audio Narrator Bar inside Article */}
              <div className="rounded-xl border border-primary/30 bg-accent/55 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-foreground">
                      BÁO NÓI AI (AI AUDIO MAGAZINE SUMMARY)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio((p) => !p)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
                  >
                    {isPlayingAudio ? (
                      <>
                        <AudioLines className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
                        <span>Đang đọc bài báo... (Dừng)</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Nghe tóm tắt bài báo (60 giây)</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs leading-relaxed italic text-foreground">
                  “{activeDestination.aiAudioSummary}”
                </p>
              </div>

              {/* Editorial Story Body with Drop-Cap & Pull-Quote */}
              <div className="space-y-4 text-sm leading-[1.8] text-foreground sm:text-base">
                {activeDestination.storyParagraphs.map((paragraph, index) => (
                  <React.Fragment key={index}>
                    <p
                      className={
                        index === 0
                          ? 'first-letter:float-left first-letter:mr-3 first-letter:text-5xl first-letter:leading-none first-letter:font-bold first-letter:text-primary first-letter:[font-family:var(--font-display)]'
                          : ''
                      }
                    >
                      {paragraph}
                    </p>

                    {index === 0 && (
                      <blockquote className="my-5 rounded-r-2xl border-l-4 border-primary bg-surface-soft px-5 py-4 text-base leading-relaxed italic text-foreground sm:text-lg">
                        {activeDestination.pullQuote}
                      </blockquote>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Interactive Entertainment & Sightseeing Spots Checklist */}
              <div className="rounded-2xl border border-border-strong bg-card p-5 shadow-2xs">
                <div className="flex flex-col gap-2 border-b border-border pb-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-primary">
                      BẢN ĐỒ TRẢI NGHIỆM & VUI CHƠI GIẢI TRÍ
                    </span>
                    <h3 className="text-lg text-foreground sm:text-xl">
                      Tích Chọn Điểm Vui Chơi Tại {activeDestination.displayLocation}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAllHighlights}
                    className="inline-flex items-center gap-1.5 self-start rounded-lg border border-primary/40 bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground sm:self-center"
                  >
                    <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {checkedHighlights.length === activeDestination.highlights.length
                        ? 'Bỏ chọn tất cả'
                        : 'Chọn toàn bộ điểm vui chơi'}
                    </span>
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {activeDestination.highlights.map((hl) => {
                    const isChecked = selectedHighlightIds.includes(hl.id);
                    return (
                      <button
                        key={hl.id}
                        type="button"
                        onClick={() => onToggleHighlight?.(hl.id, activeDestination.id)}
                        aria-pressed={isChecked}
                        className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                          isChecked
                            ? 'border-primary bg-accent/80 shadow-2xs'
                            : 'border-border bg-surface-soft/60 hover:border-primary/45 hover:bg-card'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              {isChecked ? (
                                <CheckSquare
                                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Square
                                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                                  aria-hidden="true"
                                />
                              )}
                              <span className="text-sm font-bold text-foreground">{hl.title}</span>
                            </div>
                            <span className="shrink-0 rounded bg-card px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                              {hl.estimatedCost}
                            </span>
                          </div>

                          <p className="pl-6 text-xs leading-relaxed text-muted-foreground">
                            {hl.description}
                          </p>
                        </div>

                        <div className="mt-3 space-y-1 border-t border-border/80 pt-2 pl-6 font-mono text-[11px] text-muted-foreground">
                          <div>
                            {hl.category} • Thời lượng: {hl.duration}
                          </div>
                          <div className="font-semibold text-foreground">
                            Khung giờ vàng: {hl.goldenHour}
                          </div>
                          {hl.tip && (
                            <div className="font-sans text-[11px] text-primary">
                              Mẹo: {hl.tip}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {checkedHighlights.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs">
                    <span className="font-bold text-foreground">
                      Đã tích chọn {checkedHighlights.length} hoạt động vui chơi tại{' '}
                      {activeDestination.displayLocation}
                    </span>
                    <span className="font-mono font-extrabold text-primary">
                      Tổng chi phí vé vui chơi ước tính: {formatVndCurrency(checkedActivitiesCost)}
                    </span>
                  </div>
                )}
              </div>

              {/* AI Field Notes & Local Specialties */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface-soft p-4">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-extrabold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>MẸO BẢN ĐỊA TỪ AI CONCIERGE</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-foreground">
                    {activeDestination.aiInsight}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    Thời tiết: {activeDestination.weatherSummary} • Mật độ: {activeDestination.crowdLevel}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface-soft p-4">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-extrabold uppercase tracking-wider text-primary">
                    <Utensils className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>ĐẶC SẢN ĐỊA PHƯƠNG KHÔNG THỂ BỎ LỠ</span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {activeDestination.localSpecialties.map((item, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2.5 font-mono text-[11px] text-muted-foreground">
                    Ngân sách sinh hoạt gợi ý: {activeDestination.estimatedBudgetFormatted} (
                    {activeDestination.budgetLevel})
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky Bottom Conversion Footer */}
        <div className="flex flex-col gap-3 border-t border-border-strong bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-center gap-2.5 text-xs">
            <Bus className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-bold text-foreground">
                Tuyến gợi ý: {activeDestination.suggestedOrigin} → {activeDestination.province} (
                {activeDestination.busDurationLabel})
              </p>
              <p className="text-muted-foreground">
                {activeDestination.recommendedBusType} • Giá vé chỉ từ{' '}
                <strong className="font-mono text-primary">
                  {activeDestination.busPriceFormatted}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={travelUrl}
              className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-surface-soft px-4 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary hover:bg-accent"
            >
              <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Mở trên Bản đồ lịch trình</span>
            </Link>

            <Link
              href={searchUrl}
              className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary-deep"
            >
              <Ticket className="h-4 w-4" aria-hidden="true" />
              <span>Tìm chuyến xe đến {activeDestination.province}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
