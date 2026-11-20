'use client';

import { useEffect, useState } from 'react';
import { Loader2, Star, X } from 'lucide-react';
import { useCreateReview } from '@/lib/hooks/useReviews';
import { getErrorMessage } from '@/lib/api/client';
import { StarRating } from './StarRating';
import type { Review } from '@vexeviet/types';

const MAX_COMMENT_LENGTH = 1000;

export interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  bookingCode?: string;
  routeLabel?: string;
  operatorName?: string;
  onSubmitted?: (review: Review) => void;
}

export function ReviewModal({
  open,
  onClose,
  bookingId,
  bookingCode,
  routeLabel,
  operatorName,
  onSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createReviewMutation = useCreateReview();

  useEffect(() => {
    if (!open) return;
    setRating(5);
    setComment('');
    setErrorMessage(null);
  }, [open, bookingId]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !createReviewMutation.isPending) {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, createReviewMutation.isPending]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (rating < 1 || rating > 5) {
      setErrorMessage('Vui lòng chọn số sao từ 1 đến 5.');
      return;
    }

    const trimmed = comment.trim();
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setErrorMessage(`Nhận xét tối đa ${MAX_COMMENT_LENGTH} ký tự.`);
      return;
    }

    try {
      const review = await createReviewMutation.mutateAsync({
        bookingId,
        rating,
        ...(trimmed ? { comment: trimmed } : {}),
      });
      onSubmitted?.(review);
      onClose();
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <button
        type="button"
        aria-label="Đóng hộp thoại đánh giá"
        onClick={() => {
          if (!createReviewMutation.isPending) onClose();
        }}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-hn-md">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning-ink">
                <Star className="h-4 w-4 fill-current" aria-hidden="true" />
              </span>
              <h2
                id="review-modal-title"
                className="font-display text-xl text-foreground"
              >
                Đánh giá nhà xe
              </h2>
            </div>
            {(operatorName || routeLabel || bookingCode) && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {[operatorName, routeLabel, bookingCode ? `Mã vé ${bookingCode}` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={createReviewMutation.isPending}
            aria-label="Đóng"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">
              Trải nghiệm chuyến đi của bạn thế nào?
            </p>
            <StarRating
              value={rating}
              onChange={setRating}
              size="lg"
              showLabel
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="review-comment"
                className="text-sm font-semibold text-foreground"
              >
                Nhận xét chi tiết{' '}
                <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
              </label>
              <span className="font-mono text-xs text-muted-foreground">
                {comment.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={MAX_COMMENT_LENGTH}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={createReviewMutation.isPending}
              placeholder="Chia sẻ về chất lượng xe, thái độ tài xế, sự đúng giờ..."
              className="w-full resize-none rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>

          {errorMessage ? (
            <div
              role="alert"
              className="rounded-md border border-error-ink/20 bg-error-soft px-3.5 py-2.5 text-sm font-medium text-error-ink"
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createReviewMutation.isPending}
              className="inline-flex h-[42px] items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createReviewMutation.isPending}
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-hn-sm transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createReviewMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Đang gửi...
                </>
              ) : (
                'Gửi đánh giá'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
