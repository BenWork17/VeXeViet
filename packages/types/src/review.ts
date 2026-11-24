export type ReviewStatus = 'VISIBLE' | 'HIDDEN';

export interface ReviewDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface ReviewRouteBrief {
  fromCity: string;
  toCity: string;
  departureTime?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  operatorId: string;
  routeId: string;
  operatorReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  route?: ReviewRouteBrief | null;
}

export interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  reviewerName: string;
  createdAt: string;
  route: {
    fromCity: string;
    toCity: string;
  } | null;
  tripDate: string | null;
  verified: boolean;
  operatorReply: string | null;
  repliedAt: string | null;
}

export interface ManageReview extends PublicReview {
  bookingId: string;
  bookingCode: string;
  status: ReviewStatus;
}

export interface ReviewSummary {
  operatorId: string;
  averageRating: number;
  totalReviews: number;
  distribution: ReviewDistribution;
}

export interface ManageReviewStats extends ReviewSummary {
  repliedCount: number;
  unrepliedCount: number;
  last30DaysCount: number;
}

export type ReviewEligibilityReason =
  | 'TRIP_NOT_COMPLETED'
  | 'ALREADY_REVIEWED'
  | 'NOT_OWNER'
  | null;

export interface ReviewEligibilityReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  operatorReply: string | null;
  repliedAt: string | null;
}

export interface ReviewEligibilityItem {
  canReview: boolean;
  reason: ReviewEligibilityReason;
  review: ReviewEligibilityReview | null;
}

export type ReviewEligibilityMap = Record<string, ReviewEligibilityItem>;

export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface ReplyReviewRequest {
  reply: string;
}
