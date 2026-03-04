// Shared type definitions + Drizzle-inferred types
// Re-exports inferred types from Drizzle schema for convenient imports

import type {
  repairRequests,
  repairPhotos,
  statusHistory,
  payments,
  reviews,
  notifications,
} from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Drizzle-inferred types (select = read, insert = create)
// ---------------------------------------------------------------------------

export type RepairRequest = typeof repairRequests.$inferSelect;
export type NewRepairRequest = typeof repairRequests.$inferInsert;

export type RepairPhoto = typeof repairPhotos.$inferSelect;
export type NewRepairPhoto = typeof repairPhotos.$inferInsert;

export type StatusHistoryEntry = typeof statusHistory.$inferSelect;
export type NewStatusHistoryEntry = typeof statusHistory.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ---------------------------------------------------------------------------
// Server action result type
// ---------------------------------------------------------------------------

/** Standardized return type for all server actions */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** User roles in the application */
export type UserRole = "customer" | "admin" | "technician";

/** Repair request status pipeline */
export type RepairStatus =
  | "submitted"
  | "reviewed"
  | "quote_sent"
  | "quote_accepted"
  | "in_repair"
  | "quality_check"
  | "shipped";

/** Damage type categories */
export type DamageType =
  | "tear"
  | "hole"
  | "stain"
  | "fading"
  | "logo_damage"
  | "seam_split"
  | "other";

/** Urgency levels for repair requests */
export type UrgencyLevel = "standard" | "rush" | "emergency";

/** Photo classification for repair documentation */
export type PhotoType = "before" | "during" | "after";

/** Payment status tracking */
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

/** Notification event types */
export type NotificationType =
  | "status_update"
  | "payment"
  | "review_request"
  | "assignment"
  | "system";
