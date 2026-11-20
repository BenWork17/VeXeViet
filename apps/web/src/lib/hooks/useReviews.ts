import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useReviewEligibility(bookingIds: string[], enabled = true) {
  const validIds = bookingIds.filter(Boolean);
  return useQuery({
    queryKey: reviewKeys.eligibility(validIds),
    queryFn: () => getReviewEligibility(validIds),
    enabled: enabled && validIds.length > 0,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useMyReviews(page = 1, limit = 10) {
  return useQuery({
    queryKey: reviewKeys.my(page, limit),
    queryFn: () => getMyReviews({ page, limit }),
    staleTime: 60 * 1000,
  });
}

export function useOperatorReviewSummary(operatorId?: string) {
  return useQuery({
    queryKey: reviewKeys.operatorSummary(operatorId ?? ''),
    queryFn: () => getOperatorReviewSummary(operatorId as string),
    enabled: Boolean(operatorId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useOperatorReviews(
  operatorId?: string,
  params?: GetOperatorReviewsParams
) {
  return useQuery({
    queryKey: reviewKeys.operatorList(operatorId ?? '', params),
    queryFn: () => getOperatorReviews(operatorId as string, params),
    enabled: Boolean(operatorId),
    staleTime: 60 * 1000,
    retry: 1,
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
