'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquareReply, Star } from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  Pager,
  SearchField,
  SortSelect,
  StatusPill,
  Toolbar,
} from '@/components/ui';
import { KpiStrip, type KpiCell } from '@/components/kpi-strip';
import { ListTabs } from '@/components/list-tabs';
import { useAdminSession } from '@/components/session';
import { ApiError, request, useApi } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type {
  AdminReview,
  AdminReviewStats,
  ItemResponse,
  ListResponse,
} from '@/lib/types';

type RepliedFilter = 'all' | 'unreplied' | 'replied';

const REPLIED_TABS: Array<{ id: RepliedFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unreplied', label: 'Chờ phản hồi' },
  { id: 'replied', label: 'Đã phản hồi' },
];

const RATING_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Tất cả số sao', value: '' },
  { label: '5 sao', value: '5' },
  { label: '4 sao', value: '4' },
  { label: '3 sao', value: '3' },
  { label: '2 sao', value: '2' },
  { label: '1 sao', value: '1' },
];

const SORTS: Array<{ label: string; value: string }> = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Cũ nhất', value: 'oldest' },
];

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;
const PAGE_SIZE = 20;
const MAX_REPLY_LENGTH = 1000;

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={
            star <= rating
              ? 'h-3.5 w-3.5 fill-amber-400 text-amber-500'
              : 'h-3.5 w-3.5 text-control'
          }
        />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const { session, ready } = useAdminSession();

  const [repliedFilter, setRepliedFilter] = useState<RepliedFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [sort, setSort] = useState<string>('newest');
  const [page, setPage] = useState(1);

  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim().slice(0, 100)), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [repliedFilter, ratingFilter, term, sort]);

  const listParams = useMemo(
    () => ({
      replied:
        repliedFilter === 'all'
          ? undefined
          : repliedFilter === 'replied'
            ? true
            : false,
      rating: ratingFilter ? Number(ratingFilter) : undefined,
      search: term || undefined,
      sort,
      page,
      limit: PAGE_SIZE,
    }),
    [repliedFilter, ratingFilter, term, sort, page]
  );

  const statsApi = useApi<ItemResponse<AdminReviewStats>>(
    ready && session ? '/reviews/manage/stats' : null
  );
  const listApi = useApi<ListResponse<AdminReview>>(
    ready && session ? '/reviews/manage' : null,
    listParams
  );

  const stats = statsApi.data?.data;
  const rows = listApi.data?.data ?? [];
  const pagination = listApi.data?.pagination;

  const kpiCells: KpiCell[] = useMemo(() => {
    if (!stats) {
      return [
        { label: 'Điểm trung bình', value: '—' },
        { label: 'Tổng đánh giá', value: '—' },
        { label: 'Chờ phản hồi', value: '—' },
        { label: '30 ngày gần nhất', value: '—' },
      ];
    }
    return [
      {
        label: 'Điểm trung bình',
        value: stats.totalReviews > 0 ? `${stats.averageRating.toFixed(1)} ★` : '0.0 ★',
      },
      {
        label: 'Tổng đánh giá',
        value: stats.totalReviews.toLocaleString('vi-VN'),
      },
      {
        label: 'Chờ phản hồi',
        value: stats.unrepliedCount.toLocaleString('vi-VN'),
        tone: stats.unrepliedCount > 0 ? 'negative' : 'ink',
      },
      {
        label: '30 ngày gần nhất',
        value: stats.last30DaysCount.toLocaleString('vi-VN'),
      },
    ];
  }, [stats]);

  const openReplyBox = (review: AdminReview) => {
    setReplyingId(review.id);
    setReplyDraft(review.operatorReply ?? '');
    setReplyError(null);
  };

  const closeReplyBox = () => {
    setReplyingId(null);
    setReplyDraft('');
    setReplyError(null);
  };

  const handleSubmitReply = async (reviewId: string) => {
    const trimmed = replyDraft.trim();
    if (!trimmed) {
      setReplyError('Vui lòng nhập nội dung phản hồi.');
      return;
    }
    if (trimmed.length > MAX_REPLY_LENGTH) {
      setReplyError(`Phản hồi tối đa ${MAX_REPLY_LENGTH} ký tự.`);
      return;
    }

    setReplySubmitting(true);
    setReplyError(null);

    try {
      await request<ItemResponse<AdminReview>>(`/reviews/manage/${reviewId}/reply`, {
        method: 'PUT',
        body: JSON.stringify({ reply: trimmed }),
      });
      closeReplyBox();
      listApi.reload();
      statsApi.reload();
    } catch (err) {
      if (err instanceof ApiError) {
        setReplyError(err.failure.message);
      } else {
        setReplyError('Không thể gửi phản hồi. Vui lòng thử lại.');
      }
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Đánh giá nhà xe"
        description={
          session?.role === 'ADMIN'
            ? 'Theo dõi điểm đánh giá, phân bố số sao và phản hồi khách hàng trên toàn hệ thống.'
            : 'Theo dõi trải nghiệm hành khách và phản hồi trực tiếp các đánh giá cho nhà xe của bạn.'
        }
      />

      {/* KPI Summary Strip */}
      {statsApi.error ? (
        <Card className="mt-5 px-5 pb-5 pt-1">
          <ErrorState
            message={statsApi.error.message}
            code={statsApi.error.code}
            status={statsApi.status}
            details={statsApi.error.details}
            onRetry={statsApi.reload}
          />
        </Card>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
          <KpiStrip
            cells={kpiCells}
            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          />

          {/* Star Distribution Card */}
          <Card className="px-4 py-3.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-small font-semibold text-muted">Phân bố số sao</p>
              {ratingFilter ? (
                <button
                  type="button"
                  onClick={() => setRatingFilter('')}
                  className="text-small font-semibold text-accent hover:underline"
                >
                  Bỏ lọc
                </button>
              ) : null}
            </div>
            <div className="space-y-1.5">
              {STAR_LEVELS.map((star) => {
                const count =
                  stats?.distribution?.[String(star) as keyof typeof stats.distribution] ?? 0;
                const total = stats?.totalReviews ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const selected = ratingFilter === String(star);

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setRatingFilter(selected ? '' : String(star))
                    }
                    className={`flex w-full items-center gap-2 rounded-control px-1.5 py-0.5 text-left transition-colors ${
                      selected ? 'bg-active font-semibold' : 'hover:bg-raised'
                    }`}
                  >
                    <span className="flex w-9 shrink-0 items-center gap-1 text-small text-ink tabular">
                      {star}
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" aria-hidden="true" />
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-small tabular text-muted">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Filters & Search */}
      <ListTabs
        label="Trạng thái phản hồi"
        tabs={REPLIED_TABS}
        value={repliedFilter}
        onChange={setRepliedFilter}
      />

      <Toolbar>
        <SearchField
          placeholder="Tìm mã booking, tên khách, nội dung…"
          value={query}
          onChange={setQuery}
        />
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-small text-muted">
            {pagination ? `${pagination.total} đánh giá` : listApi.loading ? 'Đang tải…' : '—'}
          </span>
          <SortSelect
            label="Số sao"
            value={ratingFilter}
            options={RATING_OPTIONS}
            onChange={setRatingFilter}
          />
          <SortSelect
            label="Sắp xếp"
            value={sort}
            options={SORTS}
            onChange={setSort}
          />
        </div>
      </Toolbar>

      {/* Reviews List */}
      {listApi.error ? (
        <ErrorState
          message={listApi.error.message}
          code={listApi.error.code}
          status={listApi.status}
          details={listApi.error.details}
          onRetry={listApi.reload}
        />
      ) : listApi.loading ? (
        <LoadingRows label="Đang tải danh sách đánh giá…" />
      ) : rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Chưa có đánh giá nào khớp bộ lọc"
            description="Thử xóa từ khóa tìm kiếm hoặc chọn lại trạng thái phản hồi / số sao."
          />
        </div>
      ) : (
        <>
          <div className="mt-4 divide-y divide-rule border-t border-rule">
            {rows.map((review) => {
              const isEditing = replyingId === review.id;
              const hasReply = Boolean(review.operatorReply);

              return (
                <article key={review.id} className="py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">
                          {review.reviewerName}
                        </span>
                        <StarRow rating={review.rating} />
                        <StatusPill tone={hasReply ? 'positive' : 'warning'}>
                          {hasReply ? 'Đã phản hồi' : 'Chờ phản hồi'}
                        </StatusPill>
                      </div>
                      <p className="mt-1 text-small text-muted">
                        Mã vé <span className="font-mono text-ink">{review.bookingCode}</span>
                        {review.route
                          ? ` · ${review.route.fromCity} → ${review.route.toCity}`
                          : ''}
                        {review.tripDate
                          ? ` · Khởi hành ${formatDateTime(review.tripDate)}`
                          : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <time
                        dateTime={review.createdAt}
                        className="text-small tabular text-muted"
                      >
                        {formatDateTime(review.createdAt)}
                      </time>
                      {!isEditing ? (
                        <Button
                          tone={hasReply ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => openReplyBox(review)}
                        >
                          <MessageSquareReply className="h-3.5 w-3.5" aria-hidden="true" />
                          {hasReply ? 'Sửa phản hồi' : 'Trả lời'}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {review.comment ? (
                    <p className="mt-2.5 whitespace-pre-line text-[13px] leading-5 text-ink">
                      {review.comment}
                    </p>
                  ) : (
                    <p className="mt-2.5 text-[13px] italic text-muted">
                      Khách hàng không để lại nhận xét văn bản.
                    </p>
                  )}

                  {hasReply && !isEditing ? (
                    <div className="mt-3 rounded-card border border-border bg-raised px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-small font-semibold text-ink">
                          <MessageSquareReply className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                          Phản hồi của nhà xe
                        </span>
                        {review.repliedAt ? (
                          <span className="text-small tabular text-muted">
                            {formatDateTime(review.repliedAt)}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 whitespace-pre-line text-[13px] leading-5 text-ink">
                        {review.operatorReply}
                      </p>
                    </div>
                  ) : null}

                  {isEditing ? (
                    <div className="mt-3 rounded-card border border-border bg-raised p-4">
                      <div className="mb-1.5 flex items-center justify-between">
                        <label
                          htmlFor={`reply-${review.id}`}
                          className="text-small font-semibold text-ink"
                        >
                          {hasReply ? 'Chỉnh sửa phản hồi nhà xe' : 'Viết phản hồi tới hành khách'}
                        </label>
                        <span className="text-small tabular text-muted">
                          {replyDraft.length}/{MAX_REPLY_LENGTH}
                        </span>
                      </div>
                      <textarea
                        id={`reply-${review.id}`}
                        rows={3}
                        maxLength={MAX_REPLY_LENGTH}
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        disabled={replySubmitting}
                        placeholder="Cảm ơn quý khách đã đồng hành cùng nhà xe..."
                        className="w-full resize-none rounded-control border border-control bg-sheet px-3 py-2 text-[13px] text-ink placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-60"
                      />
                      {replyError ? (
                        <p role="alert" className="mt-1.5 text-small font-semibold text-negative">
                          {replyError}
                        </p>
                      ) : null}
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <Button
                          tone="secondary"
                          size="sm"
                          onClick={closeReplyBox}
                          disabled={replySubmitting}
                        >
                          Hủy
                        </Button>
                        <Button
                          tone="primary"
                          size="sm"
                          isLoading={replySubmitting}
                          onClick={() => handleSubmitReply(review.id)}
                        >
                          Lưu phản hồi
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {pagination ? (
            <Pager
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              unit="đánh giá"
              onPage={setPage}
            />
          ) : null}
        </>
      )}
    </>
  );
}
