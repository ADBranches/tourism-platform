/**
 * @tourism/contracts
 * Pure domain contracts, data models, and service interfaces.
 * Framework-independent and UI-independent.
 */

// User and Actor Roles
export type UserRole =
  | "traveller"
  | "supplier"
  | "guide"
  | "driver"
  | "platform_admin"
  | "support_agent"
  | "tourism_authority";

export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly role: UserRole;
  readonly phoneNumber?: string;
  readonly countryCode: string;
  readonly verified: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Tourism Listings and Catalog
export type ListingCategory =
  | "accommodation"
  | "guided_tour"
  | "transport"
  | "cultural_experience"
  | "adventure_activity";

export interface GeographicCoordinate {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude?: number;
}

export interface MonetaryAmount {
  readonly amount: number;
  readonly currency: string; // ISO 4217
}

export interface TourismListing {
  readonly id: string;
  readonly supplierId: string;
  readonly title: string;
  readonly description: string;
  readonly category: ListingCategory;
  readonly location: {
    readonly country: string;
    readonly region: string;
    readonly locality: string;
    readonly coordinates: GeographicCoordinate;
  };
  readonly pricing: {
    readonly basePrice: MonetaryAmount;
    readonly taxInclusive: boolean;
  };
  readonly capacity: number;
  readonly isActive: boolean;
  readonly createdAt: string;
}

// Booking and Transactions
export type BookingStatus =
  | "draft"
  | "pending_payment"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refunded";

export interface Booking {
  readonly id: string;
  readonly listingId: string;
  readonly travellerId: string;
  readonly supplierId: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly guestCount: number;
  readonly totalAmount: MonetaryAmount;
  readonly status: BookingStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Provider-Neutral External Service Contracts

export interface PaymentIntentRequest {
  readonly bookingId: string;
  readonly travellerId: string;
  readonly amount: MonetaryAmount;
  readonly idempotencyKey: string;
}

export interface PaymentIntentResult {
  readonly transactionId: string;
  readonly status: "requires_payment_method" | "succeeded" | "failed";
  readonly clientSecret?: string;
}

export interface IPaymentProviderAdapter {
  createIntent(request: PaymentIntentRequest): Promise<PaymentIntentResult>;
  verifyWebhook(payload: unknown, signature: string): Promise<boolean>;
}

export interface GeoLocationQuery {
  readonly query: string;
  readonly center?: GeographicCoordinate;
  readonly radiusKm?: number;
}

export interface GeoLocationResult {
  readonly placeId: string;
  readonly displayName: string;
  readonly coordinate: GeographicCoordinate;
}

export interface IMappingProviderAdapter {
  geocode(address: string): Promise<GeoLocationResult[]>;
  reverseGeocode(
    coordinate: GeographicCoordinate,
  ): Promise<GeoLocationResult | null>;
}

export interface INotificationAdapter {
  sendTransactionalEmail(
    recipient: string,
    templateId: string,
    params: Record<string, unknown>,
  ): Promise<void>;
  sendSms(phoneNumber: string, message: string): Promise<void>;
}

// Future Service Boundary Interfaces (ASP.NET Core transactional services & FastAPI intelligence)

export interface ITransactionalPlatformClient {
  readonly serviceEndpoint: string;
  healthCheck(): Promise<{ healthy: boolean; timestamp: string }>;
}

export interface IIntelligenceServiceClient {
  readonly serviceEndpoint: string;
  generateRecommendations(
    travellerId: string,
    limit: number,
  ): Promise<string[]>;
}
