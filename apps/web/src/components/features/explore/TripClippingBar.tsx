'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Bus,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Sparkles,
  Ticket,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  EXPLORE_DESTINATIONS,
  formatVndCurrency,
  generateAiTripPlanFromSelection,
  type AiGeneratedTripPlan,
  type ExploreDestination,
} from '@/lib/data/explore-destinations';

export interface TripClippingBarProps {
  selectedDestinationIds: string[];
  selectedHighlightIds?: string[];
  onRemoveDestination?: (destinationId: string) => void;
  onToggleSelectDestination?: (destinationId: string) => void;
  onClearAll?: () => void;
  onReadArticle?: (destination: ExploreDestination) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  customTripPlan?: AiGeneratedTripPlan;
}

export type TripClippingDrawerProps = TripClippingBarProps;

export function TripClippingBar({
  selectedDestinationIds = [],
  selectedHighlightIds = [],
  onRemoveDestination,
  onToggleSelectDestination,
  onClearAll,
  onReadArticle,
  isOpen: controlledIsOpen,
  onOpenChange,
  customTripPlan,
}: TripClippingBarProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isDrawerOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setDrawerOpen = (next: boolean) => {
    setInternalIsOpen(next);
    onOpenChange?.(next);
  };

  const plan = useMemo(() => {
    if (customTripPlan) return customTripPlan;
    return generateAiTripPlanFromSelection(
      selectedDestinationIds,
      selectedHighlightIds,
    );
  }, [customTripPlan, selectedDestinationIds, selectedHighlightIds]);

  const handleRemove = (id: string) => {
    if (onRemoveDestination) {
      onRemoveDestination(id);
    } else {
      onToggleSelectDestination?.(id);
    }
  };

  const hasSelection =
    selectedDestinationIds.length > 0 || selectedHighlightIds.length > 0;

  // Hide floating bar if nothing selected and drawer is not explicitly opened
  if (!hasSelection && !isDrawerOpen) {
    return null;
  }

  return (
    <>
      {/* Expanded AI Trip Itinerary Drawer / Modal */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-[var(--z-sheet)] flex items-end justify-center bg-black/60 p-0 backdrop-blur-xs sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trip-clipping-drawer-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false);
          }}
        >
          <div className="hn-sheet-up flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-border-strong bg-background text-foreground shadow-xl sm:rounded-2xl">
            {/* Drawer Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-double border-border-strong bg-card px-5 py-4 sm:px-7">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    AI ARTICLE-TO-TRIP CONCIERGE
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    SỔ TAY HÀNH TRÌNH • TỰ ĐỘNG LẬP KẾ HOẠCH VUI CHƠI & VÉ XE
                  </span>
                </div>
                <h2
                  id="trip-clipping-drawer-title"
                  className="text-xl text-foreground sm:text-2xl"
                >
                  {plan.editorialTitle}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {hasSelection && onClearAll && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-soft px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Xóa tất cả</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Thu gọn sổ tay hành trình"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-soft text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
              {!hasSelection && (
                <div className="rounded-xl border border-primary/35 bg-accent/60 p-4 text-xs">
                  <p className="font-bold text-foreground">
                    Bạn chưa ghim địa danh nào — Đang hiển thị Lịch trình mẫu AI cho Tiêu điểm Trang nhất ({plan.selectedDestinations[0]?.displayLocation}).
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Bạn có thể bấm &ldquo;Ghim điểm đến&rdquo; hoặc tích chọn các hoạt động vui chơi trên trang báo để AI tự động tổng hợp lộ trình đa điểm cho riêng bạn.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {EXPLORE_DESTINATIONS.slice(0, 4).map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => onToggleSelectDestination?.(d.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-card px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground"
                      >
                        <Bookmark className="h-3 w-3 text-primary" aria-hidden="true" />
                        <span>+ Ghim {d.displayLocation}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Editorial Overview & Budget Breakdown */}
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 lg:col-span-7">
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-primary">
                      TỔNG QUAN LỘ TRÌNH XE KHÁCH & VUI CHƠI
                    </span>
                    <p className="text-sm leading-relaxed font-medium text-foreground">
                      {plan.editorialOverview}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      Trục di chuyển:
                    </span>
                    <span className="rounded-lg bg-accent px-2.5 py-1 font-mono text-xs font-extrabold text-accent-foreground">
                      {plan.routeSummaryLabel}
                    </span>
                  </div>
                </div>

                {/* 4 Budget Summary Boxes */}
                <div className="grid grid-cols-2 gap-2.5 lg:col-span-5">
                  <div className="rounded-xl border border-primary/40 bg-accent/60 p-3">
                    <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                      TỔNG DỰ TOÁN ({plan.totalDays} NGÀY)
                    </span>
                    <p className="mt-1 font-mono text-lg font-extrabold text-primary">
                      {plan.totalEstimatedCostFormatted}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                      VÉ XE KHÁCH VEXÉVIET
                    </span>
                    <p className="mt-1 font-mono text-base font-bold text-foreground">
                      {formatVndCurrency(plan.totalBusCost)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                      VÉ VUI CHƠI & GIẢI TRÍ
                    </span>
                    <p className="mt-1 font-mono text-base font-bold text-foreground">
                      {formatVndCurrency(plan.totalActivityCost)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                      ĂN UỐNG & LƯU TRÚ
                    </span>
                    <p className="mt-1 font-mono text-base font-bold text-foreground">
                      {formatVndCurrency(plan.totalLivingCost)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Clipped Destinations Chips Row */}
              {hasSelection && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase text-muted-foreground">
                    Điểm đến đã ghim ({plan.selectedDestinations.length}):
                  </span>
                  {plan.selectedDestinations.map((dest) => (
                    <span
                      key={dest.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-card px-3 py-1 text-xs font-bold text-foreground shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          onReadArticle?.(dest);
                        }}
                        className="hover:text-primary"
                      >
                        {dest.displayLocation}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(dest.id)}
                        aria-label={`Bỏ ghim ${dest.displayLocation}`}
                        className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Day-by-Day AI Synthesized Itinerary */}
              <div className="space-y-4">
                {plan.days.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xs"
                  >
                    {/* Day Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-soft px-4 py-3 sm:px-5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 font-mono text-xs font-extrabold text-primary-foreground">
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                          NGÀY {day.dayNumber}
                        </span>
                        <h3 className="text-base font-bold text-foreground sm:text-lg">
                          {day.destinationName}
                        </h3>
                        <span className="rounded-full border border-border bg-card px-2.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                          <Bus className="mr-1 inline h-3 w-3 text-primary" aria-hidden="true" />
                          {day.busRouteLabel} ({day.busDurationHours}h •{' '}
                          {formatVndCurrency(day.busPriceVnd)})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={day.searchUrl}
                          className="inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground hover:bg-primary hover:text-primary-foreground"
                        >
                          <Ticket className="h-3 w-3" aria-hidden="true" />
                          <span>Đặt vé chặng này</span>
                        </Link>
                      </div>
                    </div>

                    {/* 3 Time Slots (Morning / Afternoon / Evening) */}
                    <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
                      {day.slots.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex flex-col justify-between rounded-xl border border-border/80 bg-surface-soft/55 p-3.5"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1 font-mono text-[11px]">
                              <span className="font-extrabold uppercase text-primary">
                                {slot.timeOfDay}
                              </span>
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                {slot.timeRange}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground">
                              {slot.activityTitle}
                            </h4>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {slot.description}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2 font-mono text-[11px]">
                            <span className="text-muted-foreground">Chi phí dự kiến:</span>
                            <span className="font-bold text-foreground">
                              {slot.estimatedCostVnd === 0
                                ? 'Miễn phí'
                                : formatVndCurrency(slot.estimatedCostVnd)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Per-Day AI Tip */}
                    <div className="border-t border-border bg-accent/35 px-4 py-2.5 text-xs text-foreground sm:px-5">
                      <Sparkles
                        className="mr-1.5 inline h-3.5 w-3.5 text-primary"
                        aria-hidden="true"
                      />
                      <strong>Ghi chú AI Ngày {day.dayNumber}:</strong> {day.aiTip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Sticky Conversion Footer */}
            <div className="flex flex-col gap-3 border-t border-border-strong bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex items-center gap-2.5 text-xs">
                <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-bold text-foreground">
                    Tổng ngân sách dự kiến {plan.totalDays} ngày:{' '}
                    <span className="font-mono text-sm text-primary">
                      {plan.totalEstimatedCostFormatted}
                    </span>
                  </p>
                  <p className="text-muted-foreground">{plan.aiPackingAndTimingTip}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={plan.travelUrl}
                  className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-surface-soft px-4 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary hover:bg-accent"
                >
                  <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>Mở trên Bản đồ lịch trình (/travel)</span>
                </Link>

                <Link
                  href={plan.searchUrl}
                  className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary-deep"
                >
                  <Ticket className="h-4 w-4" aria-hidden="true" />
                  <span>
                    Tìm vé xe ({plan.primaryOrigin} → {plan.primaryDestination})
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Newspaper Clipping Bar */}
      {hasSelection && (
        <aside
          aria-label="Sổ tay hành trình đã ghim"
          className="fixed right-0 bottom-0 left-0 z-[var(--z-floating)] border-t-2 border-double border-primary/50 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md"
        >
          <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Selected Destinations & Highlights Summary */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
                <Bookmark className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>
                  Sổ Tay Hành Trình: {plan.selectedDestinations.length} điểm đến
                  {selectedHighlightIds.length > 0
                    ? ` • ${selectedHighlightIds.length} điểm vui chơi`
                    : ''}
                </span>
              </div>

              <div className="hidden flex-wrap items-center gap-1.5 md:flex">
                {plan.selectedDestinations.slice(0, 4).map((dest) => (
                  <span
                    key={dest.id}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-soft px-2.5 py-1 text-xs font-semibold text-foreground"
                  >
                    <span>{dest.province}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(dest.id)}
                      aria-label={`Bỏ chọn ${dest.displayLocation}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Right: AI Trip Synthesizer Button + Direct /search & /travel Links */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
              <span className="font-mono text-xs font-bold text-muted-foreground">
                Dự toán {plan.totalDays}N:{' '}
                <strong className="text-primary">{plan.totalEstimatedCostFormatted}</strong>
              </span>

              <button
                type="button"
                onClick={() => setDrawerOpen(!isDrawerOpen)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-primary bg-accent px-3.5 py-2 text-xs font-bold text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>AI Tự Động Lập Lịch Trình Vui Chơi</span>
                {isDrawerOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>

              <Link
                href={plan.travelUrl}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-border-strong bg-surface-soft px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary hover:bg-accent"
              >
                <Compass className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span className="hidden sm:inline">Bản đồ lộ trình</span>
              </Link>

              <Link
                href={plan.searchUrl}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary-deep"
              >
                <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tìm vé xe</span>
              </Link>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}

export const TripClippingDrawer = TripClippingBar;
