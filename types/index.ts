// Shared type definitions + Drizzle-inferred types
// Re-exports inferred types from Drizzle schema for convenient imports

import type {
  repairRequests,
  repairPhotos,
  statusHistory,
  payments,
  reviews,
  notifications,
  products,
  productVariants,
  personalizationOptions,
  cartItems,
  orders,
  orderItems,
  voiceNotes,
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

export type OrderResponse = Order & {
  items: Array<OrderItem & {
    productName: string;
    variantSize: string;
  }>;
  payment?: Payment | null;
};

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// E-commerce types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export type PersonalizationOption = typeof personalizationOptions.$inferSelect;
export type NewPersonalizationOption = typeof personalizationOptions.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type VoiceNote = typeof voiceNotes.$inferSelect;
export type NewVoiceNote = typeof voiceNotes.$inferInsert;

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
  | "item_received"
  | "in_repair"
  | "quality_check"
  | "ready_for_shipment"
  | "shipped"
  | "delivered"
  | "cancelled";

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

// ---------------------------------------------------------------------------
// Domain types (pricing & validation)
// ---------------------------------------------------------------------------

export type { QuoteBreakdown } from "@/lib/config/pricing";
export type { PickupAddress } from "@/lib/validators/repair";
