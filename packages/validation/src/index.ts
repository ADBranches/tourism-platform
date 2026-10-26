/**
 * @tourism/validation
 * Strict runtime validators for domain contracts.
 * Framework-independent and UI-independent.
 */

import type {
  Booking,
  ListingCategory,
  MonetaryAmount,
  TourismListing,
  UserRole,
} from "@tourism/contracts";

export interface ValidationSuccess<T> {
  readonly success: true;
  readonly data: T;
}

export interface ValidationFailure {
  readonly success: false;
  readonly errors: ReadonlyArray<{
    readonly field: string;
    readonly message: string;
  }>;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

const VALID_ROLES: ReadonlySet<UserRole> = new Set([
  "traveller",
  "supplier",
  "guide",
  "driver",
  "platform_admin",
  "support_agent",
  "tourism_authority",
]);

const VALID_CATEGORIES: ReadonlySet<ListingCategory> = new Set([
  "accommodation",
  "guided_tour",
  "transport",
  "cultural_experience",
  "adventure_activity",
]);

export function validateUserRole(role: unknown): ValidationResult<UserRole> {
  if (typeof role === "string" && VALID_ROLES.has(role as UserRole)) {
    return { success: true, data: role as UserRole };
  }
  return {
    success: false,
    errors: [{ field: "role", message: `Invalid user role: ${String(role)}` }],
  };
}

export function validateMonetaryAmount(
  value: unknown,
): ValidationResult<MonetaryAmount> {
  if (!value || typeof value !== "object") {
    return {
      success: false,
      errors: [{ field: "amount", message: "Amount object is required" }],
    };
  }

  const obj = value as Record<string, unknown>;
  const errors: Array<{ field: string; message: string }> = [];

  if (
    typeof obj["amount"] !== "number" ||
    Number.isNaN(obj["amount"]) ||
    obj["amount"] < 0
  ) {
    errors.push({
      field: "amount",
      message: "Amount must be a non-negative number",
    });
  }

  if (
    typeof obj["currency"] !== "string" ||
    obj["currency"].trim().length !== 3
  ) {
    errors.push({
      field: "currency",
      message: "Currency must be a 3-letter ISO code",
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      amount: obj["amount"] as number,
      currency: (obj["currency"] as string).toUpperCase(),
    },
  };
}

export function validateListingCategory(
  cat: unknown,
): ValidationResult<ListingCategory> {
  if (typeof cat === "string" && VALID_CATEGORIES.has(cat as ListingCategory)) {
    return { success: true, data: cat as ListingCategory };
  }
  return {
    success: false,
    errors: [
      {
        field: "category",
        message: `Invalid listing category: ${String(cat)}`,
      },
    ],
  };
}

export function validateBookingRequest(input: {
  listingId: unknown;
  travellerId: unknown;
  startDate: unknown;
  endDate: unknown;
  guestCount: unknown;
}): ValidationResult<{
  listingId: string;
  travellerId: string;
  startDate: string;
  endDate: string;
  guestCount: number;
}> {
  const errors: Array<{ field: string; message: string }> = [];

  if (typeof input.listingId !== "string" || input.listingId.trim() === "") {
    errors.push({ field: "listingId", message: "Valid listingId is required" });
  }
  if (
    typeof input.travellerId !== "string" ||
    input.travellerId.trim() === ""
  ) {
    errors.push({
      field: "travellerId",
      message: "Valid travellerId is required",
    });
  }
  if (
    typeof input.startDate !== "string" ||
    Number.isNaN(Date.parse(input.startDate))
  ) {
    errors.push({
      field: "startDate",
      message: "Valid ISO startDate is required",
    });
  }
  if (
    typeof input.endDate !== "string" ||
    Number.isNaN(Date.parse(input.endDate))
  ) {
    errors.push({ field: "endDate", message: "Valid ISO endDate is required" });
  }
  if (
    typeof input.startDate === "string" &&
    typeof input.endDate === "string" &&
    Date.parse(input.endDate) <= Date.parse(input.startDate)
  ) {
    errors.push({
      field: "endDate",
      message: "endDate must be chronologically after startDate",
    });
  }
  if (
    typeof input.guestCount !== "number" ||
    input.guestCount < 1 ||
    !Number.isInteger(input.guestCount)
  ) {
    errors.push({
      field: "guestCount",
      message: "guestCount must be a positive integer",
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      listingId: input.listingId as string,
      travellerId: input.travellerId as string,
      startDate: input.startDate as string,
      endDate: input.endDate as string,
      guestCount: input.guestCount as number,
    },
  };
}
