'use client';

import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Compass,
  Newspaper,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import {
  EDITORIAL_TICKER_ITEMS,
  EXPLORE_CATEGORIES,
  EXPLORE_REGIONS,
  type ExploreCategory,
  type ExploreRegion,
} from '@/lib/data/explore-destinations';

export type RegionFilterValue = 'Tất cả' | ExploreRegion;
export type CategoryFilterValue = 'Tất cả' | ExploreCategory;

export interface EditorialMastheadProps {
  selectedRegion?: RegionFilterValue;
  onRegionChange?: (region: RegionFilterValue) => void;
  selectedCategory?: CategoryFilterValue;
  onCategoryChange?: (category: CategoryFilterValue) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  totalArticlesCount?: number;
  filteredArticlesCount?: number;
  selectedTripCount?: number;
  onOpenTripDrawer?: () => void;
  onScrollToAiConcierge?: () => void;
  onResetFilters?: () => void;
  activeAiFilterLabel?: string | null;
}

export function EditorialMasthead({
  selectedRegion = 'Tất cả',
  onRegionChange,
  selectedCategory = 'Tất cả',
  onCategoryChange,
  searchQuery = '',
  onSearchChange,
  totalArticlesCount = 12,
  filteredArticlesCount = 12,
  selectedTripCount = 0,
  onOpenTripDrawer,
  onScrollToAiConcierge,
  onResetFilters,
  activeAiFilterLabel,
}: EditorialMastheadProps) {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    if (EDITORIAL_TICKER_ITEMS.length <= 1) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % EDITORIAL_TICKER_ITEMS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const hasActiveFilters =
    selectedRegion !== 'Tất cả' ||
    selectedCategory !== 'Tất cả' ||
    searchQuery.trim().length > 0 ||
    Boolean(activeAiFilterLabel);

  const regions: RegionFilterValue[] = ['Tất cả', ...EXPLORE_REGIONS];
  const categories: CategoryFilterValue[] = ['Tất cả', ...EXPLORE_CATEGORIES];

  return (
    <header className="w-full border-b-2 border-double border-border-strong bg-background pt-4 pb-5">
      <div className="mx-auto w-full max-w-[1520px] px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* Top Newspaper Issue & Volume Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2.5 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-primary">
              <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
              VEXÉVIET DISCOVERY • ẤN PHẨM ĐẶC BIỆT
            </span>
            <span className="hidden text-border-strong sm:inline" aria-hidden="true">
              |
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider">
              VOL. 24 • SỐ XUẤT BẢN TOÀN QUỐC (BẮC – TRUNG – NAM)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            <span className="hidden items-center gap-1.5 font-mono text-[11px] text-muted-foreground md:inline-flex">
              <Sun className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Thời tiết & Mùa vụ: Thời điểm vàng du lịch đường bộ</span>
            </span>

            {onScrollToAiConcierge && (
              <button
                type="button"
                onClick={onScrollToAiConcierge}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-accent px-3 py-1 text-xs font-bold text-accent-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>AI Cá nhân hóa trang báo</span>
              </button>
            )}

            {onOpenTripDrawer && (
              <button
                type="button"
                onClick={onOpenTripDrawer}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-card px-3 py-1 text-xs font-bold text-foreground shadow-2xs transition-colors hover:border-primary hover:text-primary"
                aria-label={`Mở sổ tay hành trình đã ghim (${selectedTripCount} điểm đến)`}
              >
                <Bookmark className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Sổ tay hành trình</span>
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 font-mono text-[11px] font-bold text-primary-foreground">
                  {selectedTripCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Live Editorial Season & Route Ticker */}
        <div className="my-2.5 flex items-center gap-3 rounded-lg border border-border bg-surface-soft px-3.5 py-2 text-xs">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded bg-primary px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground">
            <Compass className="h-3 w-3" aria-hidden="true" />
            TIÊU ĐIỂM MÙA NÀY
          </span>
          <p
            key={tickerIndex}
            className="hn-fade-in line-clamp-1 flex-1 font-medium text-foreground"
            aria-live="polite"
          >
            {EDITORIAL_TICKER_ITEMS[tickerIndex]}
          </p>
          <div className="hidden shrink-0 items-center gap-1 sm:flex" aria-label="Chuyển tin tiêu điểm">
            {EDITORIAL_TICKER_ITEMS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTickerIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === tickerIndex ? 'w-5 bg-primary' : 'w-1.5 bg-border-strong hover:bg-primary/50'
                }`}
                aria-label={`Tin tiêu điểm ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Centerpiece Newspaper Masthead Banner */}
        <div className="my-4 border-y-2 border-double border-border-strong py-5 text-center sm:py-7">
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            CHUYÊN TRANG BÁO CHÍ DU LỊCH • VĂN HÓA • ĐIỂM VUI CHƠI GIẢI TRÍ
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl leading-[1.04] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Khám Phá Việt Nam
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Đọc những bài ký sự chuyên sâu về 12 danh lam thắng cảnh biểu tượng Bắc – Trung – Nam, tích chọn các tọa độ vui chơi giải trí yêu thích và để{' '}
            <strong className="font-semibold text-foreground">AI Concierge</strong> tự động kết nối thành lịch trình xe khách VeXeViet chỉ trong một chạm.
          </p>
        </div>

        {/* Interactive Filter & Newspaper Section Index Bar */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Region Filter Tabs */}
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="tablist"
              aria-label="Lọc bài viết theo vùng miền"
            >
              <span className="mr-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Vùng miền:
              </span>
              {regions.map((region) => {
                const isActive = selectedRegion === region;
                return (
                  <button
                    key={region}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onRegionChange?.(region)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all sm:text-sm ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'border border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <span>{region === 'Tất cả' ? 'Toàn quốc (3 Miền)' : region}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Article Counter */}
            <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
              <div className="relative min-w-[240px] flex-1 sm:w-72 lg:w-80">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Tìm địa danh, tỉnh thành, trò chơi, ẩm thực..."
                  aria-label="Tìm kiếm bài báo khám phá địa danh"
                  className="h-10 w-full rounded-xl border border-input bg-field pr-9 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange?.('')}
                    aria-label="Xóa từ khóa tìm kiếm"
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="rounded-lg border border-border bg-card px-2.5 py-2 font-semibold text-foreground">
                  {filteredArticlesCount}/{totalArticlesCount} chuyên đề
                </span>
                {hasActiveFilters && onResetFilters && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="inline-flex items-center gap-1 rounded-lg border border-border-strong bg-card px-2.5 py-2 text-xs font-bold text-primary transition-colors hover:border-primary hover:bg-accent"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Section Pills */}
          <div
            className="flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5"
            aria-label="Chuyên mục báo chí"
          >
            <span className="mr-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Chuyên mục:
            </span>
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onCategoryChange?.(category)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    isActive
                      ? 'border border-primary bg-accent text-accent-foreground'
                      : 'border border-transparent bg-surface-soft text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  {category}
                </button>
              );
            })}

            {activeAiFilterLabel && (
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                <span>Chế độ AI: {activeAiFilterLabel}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
