/**
 * Compile-time contract drift guard (D7).
 *
 * Type-only: nothing here is emitted and nothing here runs. `tsc` fails the
 * moment the console's own `lib/types.ts` stops matching the shape the accepted
 * services return at `wt-be-opintegration@6710410`, which is the only drift
 * detection available in an environment with no running backend.
 *
 * Deliberately does **not** import `@vexeviet/types`: that package is stale
 * precisely where it matters (`LoginResponse`, `RouteStatus`, `VehicleType`), so
 * a check written against it would pin the console to the wrong contract.
 *
 * The `AdminUser.role` assertion is the one place a stale package type could
 * leak in transitively (via `lib/types.ts:1`); asserting the literal union here
 * means a widened `UserRole` fails this file rather than silently widening the
 * console's user table.
 */

import type {
  AdminBooking,
  AdminDashboardStats,
  AdminOperator,
  AdminPayment,
  AdminPaymentSummary,
  AdminRoute,
  AdminSession,
  AdminUser,
  AuditLogItem,
  AuditSeverity,
  BusType,
  DashboardPoint,
  ItemResponse,
  LabeledCount,
  ListResponse,
  OperatorRoute,
  OperatorStatus,
  Pagination,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  RouteStatus,
  UserStatus,
} from './types';

/* ------------------------------------------------------------------ *
 * Assertion primitives
 * ------------------------------------------------------------------ */

/** Fails to compile unless its argument is the literal type `true`. */
export type Expected<T extends true> = T;

/** Mutual assignability, member by member, including `null`/`undefined`. */
export type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;

/** Every key in `K` is present on `T`. */
export type HasKeys<T, K extends PropertyKey> = [Exclude<K, keyof T>] extends [never] ? true : false;

/** `T` has no key outside `K` — catches a stray `operatorId` on a session. */
export type HasNoExtraKeys<T, K extends PropertyKey> = [Exclude<keyof T, K>] extends [never]
  ? true
  : false;

/** `U` is exactly the union of `Members`, in both directions. */
export type Exactly<U, Members extends PropertyKey> = Equal<U, Members>;

/* ------------------------------------------------------------------ *
 * Enum / literal unions — the values the BE's Prisma enums and Zod
 * validators actually accept.
 * ------------------------------------------------------------------ */

export type RouteStatusIsExact = Expected<Exactly<RouteStatus, 'ACTIVE' | 'INACTIVE' | 'DELETED'>>;

/** O1–O6 kept the four Prisma `UserStatus` values; `REVIEW` must never appear. */
export type UserStatusIsExact = Expected<
  Exactly<UserStatus, 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'>
>;

export type OperatorStatusIsExact = Expected<
  Exactly<OperatorStatus, 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'>
>;

export type OperatorStatusHasNoReview = Expected<Equal<Extract<'REVIEW', OperatorStatus>, never>>;

export type BookingStatusIsExact = Expected<
  Exactly<AdminBooking['status'], 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED'>
>;

/** All eight Prisma `PaymentStatus` values — refunds included. */
export type PaymentStatusIsExact = Expected<
  Exactly<
    PaymentStatus,
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED'
  >
>;

export type BusTypeIsExact = Expected<Exactly<BusType, 'STANDARD' | 'VIP' | 'LIMOUSINE' | 'SLEEPER'>>;

export type PaymentMethodIsExact = Expected<
  Exactly<PaymentMethod, 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER' | 'CASH'>
>;

/**
 * `PROVIDER_BY_METHOD` in `payment.service.ts` emits exactly these five labels.
 * Both cash-like providers must remain representable: an OPERATOR's offline
 * payments are `BankTransfer`/`Cash`, not a gateway.
 */
export type PaymentProviderIsExact = Expected<
  Exactly<PaymentProvider, 'VNPay' | 'Momo' | 'ZaloPay' | 'BankTransfer' | 'Cash'>
>;

export type AuditSeverityIsExact = Expected<Exactly<AuditSeverity, 'info' | 'warning' | 'danger'>>;

/* ------------------------------------------------------------------ *
 * Session — scope may only ever come from the verified token (O2/O3).
 * ------------------------------------------------------------------ */

export type SessionKeys = Expected<HasKeys<AdminSession, 'id' | 'name' | 'email' | 'role'>>;

export type SessionCarriesNoOperatorId = Expected<
  HasNoExtraKeys<AdminSession, 'id' | 'name' | 'email' | 'role'>
>;

export type SessionRoleIsAdminOrOperator = Expected<
  Equal<Extract<'CUSTOMER', AdminSession['role']>, never>
>;

/* ------------------------------------------------------------------ *
 * Envelopes
 * ------------------------------------------------------------------ */

export type PaginationKeys = Expected<HasKeys<Pagination, 'page' | 'limit' | 'total' | 'totalPages'>>;

export type ListEnvelopeIsSuccessOnly = Expected<Equal<ListResponse<unknown>['success'], true>>;

export type ItemEnvelopeIsSuccessOnly = Expected<Equal<ItemResponse<unknown>['success'], true>>;

export type ListEnvelopeKeys = Expected<
  HasKeys<ListResponse<unknown>, 'success' | 'data' | 'pagination'>
>;

/* ------------------------------------------------------------------ *
 * Bookings
 * ------------------------------------------------------------------ */

export type BookingKeys = Expected<
  HasKeys<
    AdminBooking,
    | 'id'
    | 'bookingCode'
    | 'customerName'
    | 'customerEmail'
    | 'customerPhone'
    | 'operatorId'
    | 'operatorName'
    | 'routeId'
    | 'routeName'
    | 'departureDate'
    | 'seats'
    | 'status'
    | 'paymentStatus'
    | 'totalAmount'
    | 'createdAt'
  >
>;

/** `formatAdminBooking` uses `row.payments[0]?.status ?? null`. */
export type BookingPaymentStatusIsNullable = Expected<
  Equal<Extract<AdminBooking['paymentStatus'], null>, null>
>;

/** A date-only string (`YYYY-MM-DD`), not an ISO instant. */
export type BookingDepartureDateIsString = Expected<
  Equal<AdminBooking['departureDate'], string>
>;

export type BookingSeatsAreStrings = Expected<Equal<AdminBooking['seats'], string[]>>;

/* ------------------------------------------------------------------ *
 * Dashboard — every field is a number or a two-field point.
 * ------------------------------------------------------------------ */

export type DashboardStatsKeys = Expected<
  HasKeys<
    AdminDashboardStats,
    | 'todayBookings'
    | 'revenueCompleted'
    | 'paymentsNeedingAction'
    | 'activeRoutes'
    | 'operatorCount'
    | 'revenueTrend'
    | 'bookingStatusSummary'
  >
>;

export type DashboardPointIsLabeledValue = Expected<Equal<DashboardPoint, { label: string; value: number }>>;

export type RevenueTrendIsPoints = Expected<
  Equal<AdminDashboardStats['revenueTrend'], DashboardPoint[]>
>;

export type BookingStatusSummaryIsPoints = Expected<
  Equal<AdminDashboardStats['bookingStatusSummary'], DashboardPoint[]>
>;

/* ------------------------------------------------------------------ *
 * Payments
 * ------------------------------------------------------------------ */

export type PaymentKeys = Expected<
  HasKeys<
    AdminPayment,
    | 'id'
    | 'bookingCode'
    | 'provider'
    | 'method'
    | 'status'
    | 'amount'
    | 'risk'
    | 'transactionRef'
    | 'createdAt'
    | 'updatedAt'
  >
>;

/** `deriveRisk` returns exactly these three. */
export type PaymentRiskIsExact = Expected<Exactly<AdminPayment['risk'], 'normal' | 'watch' | 'urgent'>>;

export type PaymentSummaryKeys = Expected<
  HasKeys<AdminPaymentSummary, 'totalCompleted' | 'countByStatus' | 'providerTrend' | 'expiredCount'>
>;

export type LabeledCountIsLabeledValue = Expected<Equal<LabeledCount, { label: string; value: number }>>;

/* ------------------------------------------------------------------ *
 * Routes — nullable seat data is the whole "unknown vs zero" distinction.
 * ------------------------------------------------------------------ */

export type RouteKeys = Expected<
  HasKeys<
    AdminRoute,
    | 'id'
    | 'operatorId'
    | 'operatorName'
    | 'name'
    | 'origin'
    | 'destination'
    | 'departureTime'
    | 'busType'
    | 'totalSeats'
    | 'availableSeats'
    | 'price'
    | 'status'
    | 'seatDataAvailable'
    | 'hasBusTemplate'
  >
>;

export type RouteTotalSeatsIsNullable = Expected<
  Equal<Extract<AdminRoute['totalSeats'], null>, null>
>;

export type RouteAvailableSeatsIsNullable = Expected<
  Equal<Extract<AdminRoute['availableSeats'], null>, null>
>;

/** O1: `OperatorRoute = AdminRoute` — one table, no per-role column fork. */
export type OperatorRouteIsAdminRoute = Expected<Equal<OperatorRoute, AdminRoute>>;

export type OperatorKeys = Expected<
  HasKeys<
    AdminOperator,
    'id' | 'name' | 'contactEmail' | 'activeRoutes' | 'monthlyBookings' | 'rating' | 'status' | 'createdAt'
  >
>;

/** The refactor dropped the rating column because this is always `null`. */
export type OperatorRatingIsNull = Expected<Equal<AdminOperator['rating'], null>>;

export type OperatorStatusIsAccountStatus = Expected<Equal<AdminOperator['status'], OperatorStatus>>;

/* ------------------------------------------------------------------ *
 * Users & audit logs
 * ------------------------------------------------------------------ */

export type AdminUserKeys = Expected<
  HasKeys<
    AdminUser,
    | 'id'
    | 'name'
    | 'email'
    | 'phone'
    | 'role'
    | 'status'
    | 'verified'
    | 'isEmailVerified'
    | 'isPhoneVerified'
    | 'createdAt'
  >
>;

export type AdminUserRoleIsThree = Expected<
  Exactly<AdminUser['role'], 'ADMIN' | 'OPERATOR' | 'CUSTOMER'>
>;

export type AdminUserStatusIsExact = Expected<Equal<AdminUser['status'], UserStatus>>;

export type AdminUserPhoneIsNullable = Expected<Equal<Extract<AdminUser['phone'], null>, null>>;

export type AuditLogKeys = Expected<
  HasKeys<
    AuditLogItem,
    'id' | 'actor' | 'actorId' | 'role' | 'action' | 'target' | 'severity' | 'metadata' | 'createdAt'
  >
>;

/** `actorId` is null for system-generated rows. */
export type AuditActorIdIsNullable = Expected<Equal<Extract<AuditLogItem['actorId'], null>, null>>;

/** `metadata` is arbitrary JSON — the page stringifies it, never indexes it. */
export type AuditMetadataIsUnknown = Expected<Equal<AuditLogItem['metadata'], unknown>>;
