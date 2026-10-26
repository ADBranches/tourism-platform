import { describe, expect, it } from "vitest";
import {
  validateBookingRequest,
  validateListingCategory,
  validateMonetaryAmount,
  validateUserRole,
} from "./index.js";

describe("@tourism/validation", () => {
  it("validates legitimate user roles", () => {
    const valid = validateUserRole("traveller");
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data).toBe("traveller");
    }

    const invalid = validateUserRole("super_hacker");
    expect(invalid.success).toBe(false);
  });

  it("validates monetary amounts", () => {
    const valid = validateMonetaryAmount({ amount: 150.5, currency: "usd" });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.amount).toBe(150.5);
      expect(valid.data.currency).toBe("USD");
    }

    const invalid = validateMonetaryAmount({ amount: -10, currency: "USD" });
    expect(invalid.success).toBe(false);
  });

  it("validates listing categories", () => {
    const valid = validateListingCategory("guided_tour");
    expect(valid.success).toBe(true);

    const invalid = validateListingCategory("flying_saucer");
    expect(invalid.success).toBe(false);
  });

  it("validates booking requests", () => {
    const valid = validateBookingRequest({
      listingId: "listing-123",
      travellerId: "traveller-456",
      startDate: "2026-11-01T10:00:00Z",
      endDate: "2026-11-05T10:00:00Z",
      guestCount: 2,
    });
    expect(valid.success).toBe(true);

    const invalidDate = validateBookingRequest({
      listingId: "listing-123",
      travellerId: "traveller-456",
      startDate: "2026-11-10T10:00:00Z",
      endDate: "2026-11-05T10:00:00Z",
      guestCount: 2,
    });
    expect(invalidDate.success).toBe(false);
  });
});
