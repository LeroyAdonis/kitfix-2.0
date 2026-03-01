// TODO: Implement — Shared type definitions + Drizzle infers
// Export inferred types from Drizzle schema for type-safe queries

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
