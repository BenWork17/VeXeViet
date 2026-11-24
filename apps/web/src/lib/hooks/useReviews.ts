import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReview,
  getMyReviews,
  getOperatorReviews,
  getOperatorReviewSummary,
  getReviewEligibility,
  type GetOperatorReviewsParams,
} from '@/lib/api/reviews';
import type { CreateReviewRequest } from '@vexeviet/types';

export const reviewKeys = {
  all: ['reviews'] as const,
  my: (page?: number, limit?: number) => [...reviewKeys.all, 'my', { page, limit }] as const,
  eligibility: (bookingIds: string[]) =>
    [...reviewKeys.all, 'eligibility', [...bookingIds].sort().join(',')] as const,
  operatorSummary: (operatorId: string) =>
    [...reviewKeys.all, 'operator', operatorId, 'summary'] as const,
  operatorList: (operatorId: string, params?: GetOperatorReviewsParams) =>
    [...reviewKeys.all, 'operator', operatorId, 'list', params ?? {}] as const,
};

export const reviewQueries = {
  all: () => reviewKeys.all,
  my: (page = 1, limit = 10) =>
    queryOptions({
      queryKey: reviewKeys.my(page, limit),
      queryFn: () => getMyReviews({ page, limit }),
      staleTime: 60 * 1000,
    }),
  eligibility: (bookingIds: string[]) => {
    const validIds = bookingIds.filter(Boolean);
    return queryOptions({
      queryKey: reviewKeys.eligibility(validIds),
      queryFn: () => getReviewEligibility(validIds),
      staleTime: 60 * 1000,
      retry: 1,
    });
  },
  operatorSummary: (operatorId: string) =>
    queryOptions({
      queryKey: reviewKeys.operatorSummary(operatorId),
      queryFn: () => getOperatorReviewSummary(operatorId),
      staleTime: 2 * 60 * 1000,
      retry: 1,
    }),
  operatorList: (operatorId: string, params?: GetOperatorReviewsParams) =>
    queryOptions({
      queryKey: reviewKeys.operatorList(operatorId, params),
      queryFn: () => getOperatorReviews(operatorId, params),
      staleTime: 60 * 1000,
      retry: 1,
    }),
};

export function useReviewEligibility(bookingIds: string[], enabled = true) {
  const validIds = bookingIds.filter(Boolean);
  return useQuery({
    ...reviewQueries.eligibility(validIds),
    enabled: enabled && validIds.length > 0,
  });
}

export function useMyReviews(page = 1, limit = 10) {
  return useQuery(reviewQueries.my(page, limit));
}

export function useOperatorReviewSummary(operatorId?: string) {
  return useQuery({
    ...reviewQueries.operatorSummary(operatorId ?? ''),
    enabled: Boolean(operatorId),
  });
}

export function useOperatorReviews(operatorId?: string, params?: GetOperatorReviewsParams) {
  return useQuery({
    ...reviewQueries.operatorList(operatorId ?? '', params),
    enabled: Boolean(operatorId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(data),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: [...reviewKeys.all, 'eligibility'] });
      queryClient.invalidateQueries({ queryKey: [...reviewKeys.all, 'my'] });
      if (review?.operatorId) {
        queryClient.invalidateQueries({
          queryKey: reviewKeys.operatorSummary(review.operatorId),
        });
        queryClient.invalidateQueries({
          queryKey: [...reviewKeys.all, 'operator', review.operatorId, 'list'],
        });
      }
    },
  });
}
