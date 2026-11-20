'use client';

import React, { useState } from 'react';
import { Compass, Newspaper, RotateCcw, Sparkles } from 'lucide-react';
import {
  EXPLORE_DESTINATIONS,
  type ExploreDestination,
  type ScoredExploreDestination,
} from '@/lib/data/explore-destinations';
import { EditorialArticleCard } from './EditorialArticleCard';
import { Destination3DCameraModal } from './Destination3DCameraModal';

export interface EditorialNewspaperGridProps {
  destinations?: Array<ExploreDestination | ScoredExploreDestination>;
  articles?: Array<ExploreDestination | ScoredExploreDestination>;
  selectedDestinationIds?: string[];
  onToggleSelectDestination?: (destinationId: string) => void;
  onReadArticle?: (destination: ExploreDestination) => void;
  onOpen3DCamera?: (destination: ExploreDestination) => void;
  selectedHighlightIds?: string[];
  onToggleHighlight?: (highlightId: string, destinationId?: string) => void;
  showAiMatchBadge?: boolean;
  onResetFilters?: () => void;
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export type EditorialBentoGridProps = EditorialNewspaperGridProps;

export function EditorialNewspaperGrid({
  destinations,
  articles,
  selectedDestinationIds = [],
  onToggleSelectDestination,
  onReadArticle,
  onOpen3DCamera,
  selectedHighlightIds = [],
  onToggleHighlight,
  showAiMatchBadge = false,
  onResetFilters,
  sectionTitle = 'Chuyên Mục Danh Lam Thắng Cảnh & Điểm Vui Chơi Giải Trí',
  sectionSubtitle = 'Tích chọn các hoạt động vui chơi bạn yêu thích hoặc bấm "Street View 360°" trên từng bài báo để xoay nhìn xung quanh thực tế và dự toán chi phí xe khách.',
}: EditorialNewspaperGridProps) {
  const items = destinations ?? articles ?? EXPLORE_DESTINATIONS;
  const [fallback3DDest, setFallback3DDest] = useState<ExploreDestination | null>(null);

  const handleOpen3D = (dest: ExploreDestination) => {
    if (onOpen3DCamera) {
      onOpen3DCamera(dest);
    } else {
      setFallback3DDest(dest);
    }
  };

  const northCount = items.filter((d) => d.region === 'Miền Bắc').length;
  const centralCount = items.filter((d) => d.region === 'Miền Trung').length;
  const southCount = items.filter((d) => d.region === 'Miền Nam').length;

  return (
    <section
      aria-labelledby="newspaper-grid-heading"
      className="w-full bg-background py-8 lg:py-11"
    >
      <div className="mx-auto w-full max-w-[1520px] px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* Newspaper Section Header */}
        <div className="mb-6 flex flex-col gap-3 border-b-2 border-double border-border-strong pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-extrabold uppercase tracking-widest text-primary">
                <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
                MỤC LỤC CHUYÊN ĐỀ ĐỊA DANH VIỆT NAM
              </span>
              {showAiMatchBadge && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                  <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                  Đã sắp xếp theo độ tương thích AI
                </span>
              )}
            </div>
            <h2 id="newspaper-grid-heading" className="text-2xl text-foreground sm:text-3xl">
              {sectionTitle}
            </h2>
            <p className="max-w-3xl text-sm text-muted-foreground">{sectionSubtitle}</p>
          </div>

          {/* Region Distribution Counters */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="rounded-lg border border-border bg-card px-2.5 py-1.5 font-semibold text-foreground">
              Miền Bắc: <strong className="text-primary">{northCount}</strong>
            </span>
            <span className="rounded-lg border border-border bg-card px-2.5 py-1.5 font-semibold text-foreground">
              Miền Trung: <strong className="text-primary">{centralCount}</strong>
            </span>
            <span className="rounded-lg border border-border bg-card px-2.5 py-1.5 font-semibold text-foreground">
              Miền Nam: <strong className="text-primary">{southCount}</strong>
            </span>
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-2xs">
            <Compass className="h-10 w-10 text-primary" aria-hidden="true" />
            <h3 className="mt-3 text-xl text-foreground">
              Không tìm thấy bài viết phù hợp với bộ lọc hiện tại
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              Hãy thử mở rộng vùng miền, đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc AI để khám phá trọn bộ 12 danh lam thắng cảnh Bắc – Trung – Nam.
            </p>
            {onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary-deep"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Xem lại toàn bộ ấn phẩm</span>
              </button>
            )}
          </div>
        ) : (
          /* Editorial Multi-Column Grid */
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => {
              const isSelected = selectedDestinationIds.includes(item.id);
              const isWideFeature = index === 0 && items.length % 3 === 1 && items.length > 3;

              return (
                <div
                  key={item.id}
                  className={isWideFeature ? 'md:col-span-2 xl:col-span-2' : ''}
                >
                  <EditorialArticleCard
                    destination={item}
                    isSelected={isSelected}
                    onToggleSelect={onToggleSelectDestination}
                    onReadArticle={onReadArticle}
                    onOpen3DCamera={handleOpen3D}
                    selectedHighlightIds={selectedHighlightIds}
                    onToggleHighlight={onToggleHighlight}
                    featured={isWideFeature || item.columnSpan === 'wide'}
                    showAiMatchBadge={showAiMatchBadge}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {fallback3DDest && (
        <Destination3DCameraModal
          destination={fallback3DDest}
          isOpen={Boolean(fallback3DDest)}
          onClose={() => setFallback3DDest(null)}
          selectedHighlightIds={selectedHighlightIds}
          onToggleHighlight={onToggleHighlight}
        />
      )}
    </section>
  );
}

export const EditorialBentoGrid = EditorialNewspaperGrid;
