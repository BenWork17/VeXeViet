'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  CircleAlert,
  MessageSquareReply,
  RefreshCw,
  Star,
} from 'lucide-react';
import {
  useOperatorReviews,
  useOperatorReviewSummary,
} from '@/lib/hooks/useReviews';
import { StarRating } from './StarRating';
import { cn } from '@/lib/utils';

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

type SortOption = 'newest' | 'highest' | 'lowest';

function formatReviewDate(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function OperatorRatingChip({
  rating,
  reviewCount,
  className,
}: {
  rating?: number | null;
  reviewCount?: number | null;
  className?: string;
}) {
  const hasReviews = typeof reviewCount === 'number' && reviewCount > 0;
  const numericRating = typeof rating === 'number' && rating > 0 ? rating : null;

  if (!numericRating && !hasReviews) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground',
          className
        )}
      >
        <Star className="h-3 w-3" aria-hidden="true" />
        Chưa có đánh giá
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning-ink',
        className
      )}
    >
      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
      <span>{numericRating ? numericRating.toFixed(1) : '0.0'}</span>
      {hasReviews ? (
        <span className="font-normal text-warning-ink/80">
          ({reviewCount} đánh giá)
        </span>
      ) : null}
    </span>
  );
}

export function OperatorReviewsSection({
  operatorId,
  operatorName,
}: {
  operatorId?: string;
  operatorName?: string;
}) {
  const [selectedRating, setSelectedRating] = useState<number | undefined>(
    undefined
  );
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);

  const summaryQuery = useOperatorReviewSummary(operatorId);
  const reviewsQuery = useOperatorReviews(operatorId, {
    page,
    limit: 10,
    rating: selectedRating,
    sort,
  });

  if (!operatorId) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Chưa có thông tin nhà xe để hiển thị đánh giá.
      </div>
    );
  }

  const summary = summaryQuery.data;
  const reviews = reviewsQuery.data?.data ?? [];
  const pagination = reviewsQuery.data?.pagination;

  const handleFilterRating = (rating?: number) => {
    setSelectedRating(rating);
    setPage(1);
  };

  const handleSortChange = (nextSort: SortOption) => {
    setSort(nextSort);
    setPage(1);
  };

  return (
    <section
      id="operator-reviews"
      aria-labelledby="operator-reviews-heading"
      className="overflow-hidden rounded-lg border border-border bg-card shadow-hn"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3
            id="operator-reviews-heading"
            className="font-display text-lg text-foreground"
          >
            Đánh giá từ hành khách
            {operatorName ? ` · ${operatorName}` : ''}
          </h3>
        </div>
        {summary && summary.totalReviews > 0 ? (
          <span className="text-xs font-semibold text-muted-foreground">
            {summary.totalReviews.toLocaleString('vi-VN')} lượt đánh giá đã xác thực
          </span>
        ) : null}
      </div>

      <div className="space-y-6 p-6">
        {/* Summary & Star Breakdown */}
        {summaryQuery.isLoading ? (
          <div className="grid gap-6 rounded-md border border-border bg-background p-5 md:grid-cols-[200px_1fr]">
            <div className="h-24 animate-pulse rounded-md bg-muted" />
            <div className="space-y-2.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        ) : summaryQuery.isError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-4">
            <p className="flex items-center gap-2 text-sm text-error-ink">
              <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              Không thể tải thống kê đánh giá của nhà xe.
            </p>
            <button
              type="button"
              onClick={() => summaryQuery.refetch()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Thử lại
            </button>
          </div>
        ) : summary ? (
          <div className="grid gap-6 rounded-md border border-border bg-background p-5 md:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center justify-center border-b border-border pb-4 text-center md:border-b-0 md:border-r md:pb-0 md:pr-6">
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl font-bold text-foreground">
                  {summary.totalReviews > 0 ? summary.averageRating.toFixed(1) : '0.0'}
                </span>
                <span className="text-sm font-medium text-muted-foreground">/ 5</span>
              </div>
              <div className="mt-2">
                <StarRating value={summary.averageRating} readOnly size="md" />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {summary.totalReviews > 0
                  ? `${summary.totalReviews.toLocaleString('vi-VN')} đánh giá`
                  : 'Chưa có đánh giá'}
              </p>
            </div>

            <div className="space-y-2">
              {STAR_LEVELS.map((star) => {
                const count = summary.distribution?.[String(star) as keyof typeof summary.distribution] ?? 0;
                const percent =
                  summary.totalReviews > 0
                    ? Math.round((count / summary.totalReviews) * 100)
                    : 0;
                const isActive = selectedRating === star;

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleFilterRating(isActive ? undefined : star)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-sm px-2 py-1 text-left transition-colors',
                      isActive ? 'bg-accent' : 'hover:bg-muted/70'
                    )}
                  >
                    <span className="flex w-12 shrink-0 items-center gap-1 text-xs font-semibold text-foreground">
                      {star}
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" aria-hidden="true" />
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono text-xs text-muted-foreground">
                      {count} ({percent}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Filter & Sort Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Lọc theo số sao">
            <button
              type="button"
              onClick={() => handleFilterRating(undefined)}
              className={cn(
                'rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors',
                selectedRating === undefined
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              )}
            >
              Tất cả
            </button>
            {STAR_LEVELS.map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleFilterRating(star)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors',
                  selectedRating === star
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-muted'
                )}
              >
                {star} sao
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>Sắp xếp:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              <option value="newest">Mới nhất</option>
              <option value="highest">Điểm cao nhất</option>
              <option value="lowest">Điểm thấp nhất</option>
            </select>
          </label>
        </div>

        {/* Reviews List */}
        {reviewsQuery.isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-md border border-border bg-muted/60"
              />
            ))}
          </div>
        ) : reviewsQuery.isError ? (
          <div className="rounded-md border border-border bg-background p-6 text-center">
            <p className="text-sm font-semibold text-error-ink">
              Không thể tải danh sách đánh giá. Vui lòng thử lại.
            </p>
            <button
              type="button"
              onClick={() => reviewsQuery.refetch()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Tải lại
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-background px-6 py-10 text-center">
            <Star className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
            <p className="font-display text-base text-foreground">
              {selectedRating
                ? `Chưa có đánh giá ${selectedRating} sao nào`
                : 'Chưa có đánh giá nào cho nhà xe này'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedRating
                ? 'Hãy chọn bộ lọc khác để xem các nhận xét từ hành khách.'
                : 'Hành khách sau khi hoàn thành chuyến đi sẽ có thể gửi đánh giá tại đây.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-md border border-border bg-background p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {review.reviewerName}
                      </span>
                      {review.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success-ink">
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          Đã đi chuyến này
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <StarRating value={review.rating} readOnly size="sm" />
                      {review.route ? (
                        <span>
                          · {review.route.fromCity} → {review.route.toCity}
                        </span>
                      ) : null}
                      {review.tripDate ? (
                        <span>· Chuyến {formatReviewDate(review.tripDate)}</span>
                      ) : null}
                    </div>
                  </div>
                  <time
                    dateTime={review.createdAt}
                    className="text-xs text-muted-foreground"
                  >
                    {formatReviewDate(review.createdAt)}
                  </time>
                </div>

                {review.comment ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
                    {review.comment}
                  </p>
                ) : (
                  <p className="mt-3 text-xs italic text-muted-foreground">
                    Hành khách không để lại nhận xét chi tiết.
                  </p>
                )}

                {review.operatorReply ? (
                  <div className="mt-4 rounded-md border border-border bg-card p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <MessageSquareReply className="h-3.5 w-3.5" aria-hidden="true" />
                        Phản hồi từ nhà xe
                      </span>
                      {review.repliedAt ? (
                        <span className="text-[11px] text-muted-foreground">
                          {formatReviewDate(review.repliedAt)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground">
                      {review.operatorReply}
                    </p>
                  </div>
                ) : null}
              </article>
            ))}

            {pagination && pagination.totalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">
                  Trang {pagination.page} / {pagination.totalPages} ({pagination.total} đánh giá)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trang trước
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
