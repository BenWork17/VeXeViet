import apiClient from './client';
import {
  API_ENDPOINTS,
  ApiResponse,
  CreateReviewRequest,
  PaginatedResponse,
  PublicReview,
  Review,
  ReviewEligibilityMap,
  ReviewSummary,
} from '@vexeviet/types';

export interface GetOperatorReviewsParams {
  page?: number;
  limit?: number;
  rating?: number;
  sort?: 'newest' | 'highest' | 'lowest';
}

export async function createReview(data: CreateReviewRequest): Promise<Review> {
  const response = await apiClient.post<ApiResponse<Review>>(
    API_ENDPOINTS.REVIEWS_CREATE,
    data
  );
  return response.data.data;
}

export async function getMyReviews(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Review>> {
  const response = await apiClient.get<PaginatedResponse<Review>>(
    API_ENDPOINTS.REVIEWS_MY,
    { params }
  );
  return response.data;
}

export async function getReviewEligibility(
  bookingIds: string[]
): Promise<ReviewEligibilityMap> {
  const uniqueIds = Array.from(new Set(bookingIds.filter(Boolean))).slice(0, 50);
  if (uniqueIds.length === 0) {
    return {};
  }

  const response = await apiClient.get<ApiResponse<ReviewEligibilityMap>>(
    API_ENDPOINTS.REVIEWS_ELIGIBILITY,
    {
      params: { bookingIds: uniqueIds.join(',') },
    }
  );
  return response.data.data ?? {};
}

export async function getOperatorReviewSummary(
  operatorId: string
): Promise<ReviewSummary> {
  const response = await apiClient.get<ApiResponse<ReviewSummary>>(
    API_ENDPOINTS.REVIEWS_OPERATOR_SUMMARY(operatorId)
  );
  return response.data.data;
}

export async function getOperatorReviews(
  operatorId: string,
  params?: GetOperatorReviewsParams
): Promise<PaginatedResponse<PublicReview>> {
  const response = await apiClient.get<PaginatedResponse<PublicReview>>(
    API_ENDPOINTS.REVIEWS_OPERATOR_LIST(operatorId),
    { params }
  );
  return response.data;
}
