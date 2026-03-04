import { relations } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const damageTypeEnum = pgEnum("damage_type", [
  "tear",
  "hole",
  "stain",
  "fading",
  "logo_damage",
  "seam_split",
  "other",
]);

export const urgencyLevelEnum = pgEnum("urgency_level", [
  "standard",
  "rush",
  "emergency",
]);

export const repairStatusEnum = pgEnum("repair_status", [
  "submitted",
  "reviewed",
  "quote_sent",
  "quote_accepted",
  "in_repair",
  "quality_check",
  "shipped",
]);

export const photoTypeEnum = pgEnum("photo_type", [
  "before",
  "during",
  "after",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "status_update",
  "payment",
  "review_request",
  "assignment",
  "system",
]);

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "admin",
  "technician",
]);

// ---------------------------------------------------------------------------
// Better Auth tables
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("customer"),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Application tables
// ---------------------------------------------------------------------------

export const repairRequests = pgTable(
  "repair_requests",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    technicianId: text("technician_id").references(() => user.id, {
      onDelete: "set null",
    }),
    jerseyDescription: text("jersey_description").notNull(),
    jerseyBrand: text("jersey_brand"),
    jerseySize: varchar("jersey_size", { length: 10 }).notNull(),
    damageType: damageTypeEnum("damage_type").notNull(),
    damageDescription: text("damage_description").notNull(),
    urgencyLevel: urgencyLevelEnum("urgency_level")
      .notNull()
      .default("standard"),
    currentStatus: repairStatusEnum("current_status")
      .notNull()
      .default("submitted"),
    estimatedCost: integer("estimated_cost"),
    finalCost: integer("final_cost"),
    aiDamageAssessment: jsonb("ai_damage_assessment"),
    adminNotes: text("admin_notes"),
    quoteDeclineReason: text("quote_decline_reason"),
    trackingNumber: varchar("tracking_number", { length: 100 }),
    shippingAddress: jsonb("shipping_address"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_repair_requests_customer_id").on(table.customerId),
    index("idx_repair_requests_technician_id").on(table.technicianId),
    index("idx_repair_requests_current_status").on(table.currentStatus),
    index("idx_repair_requests_created_at").on(table.createdAt),
  ],
);

export const repairPhotos = pgTable(
  "repair_photos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    repairRequestId: text("repair_request_id")
      .notNull()
      .references(() => repairRequests.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    originalFilename: text("original_filename").notNull(),
    mimeType: varchar("mime_type", { length: 50 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    photoType: photoTypeEnum("photo_type").notNull(),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_repair_photos_repair_request_id").on(table.repairRequestId),
  ],
);

export const statusHistory = pgTable(
  "status_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    repairRequestId: text("repair_request_id")
      .notNull()
      .references(() => repairRequests.id, { onDelete: "cascade" }),
    fromStatus: repairStatusEnum("from_status"),
    toStatus: repairStatusEnum("to_status").notNull(),
    changedBy: text("changed_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_status_history_repair_request_id").on(table.repairRequestId),
    index("idx_status_history_created_at").on(table.createdAt),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    repairRequestId: text("repair_request_id")
      .notNull()
      .references(() => repairRequests.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    polarCheckoutId: text("polar_checkout_id").notNull().unique(),
    polarOrderId: text("polar_order_id").unique(),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("usd"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    paidAt: timestamp("paid_at"),
    refundedAt: timestamp("refunded_at"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_payments_repair_request_id").on(table.repairRequestId),
    index("idx_payments_polar_checkout_id").on(table.polarCheckoutId),
    index("idx_payments_polar_order_id").on(table.polarOrderId),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    repairRequestId: text("repair_request_id")
      .notNull()
      .unique()
      .references(() => repairRequests.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    technicianResponse: text("technician_response"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    check("rating_range", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    repairRequestId: text("repair_request_id").references(
      () => repairRequests.id,
      { onDelete: "set null" },
    ),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_notifications_user_is_read").on(table.userId, table.isRead),
    index("idx_notifications_created_at").on(table.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// Relations (for Drizzle relational query builder)
// ---------------------------------------------------------------------------

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  repairRequestsAsCustomer: many(repairRequests, {
    relationName: "customer",
  }),
  repairRequestsAsTechnician: many(repairRequests, {
    relationName: "technician",
  }),
  repairPhotos: many(repairPhotos),
  payments: many(payments),
  reviews: many(reviews),
  notifications: many(notifications),
  statusChanges: many(statusHistory),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const repairRequestRelations = relations(
  repairRequests,
  ({ one, many }) => ({
    customer: one(user, {
      fields: [repairRequests.customerId],
      references: [user.id],
      relationName: "customer",
    }),
    technician: one(user, {
      fields: [repairRequests.technicianId],
      references: [user.id],
      relationName: "technician",
    }),
    photos: many(repairPhotos),
    statusHistory: many(statusHistory),
    payments: many(payments),
    review: one(reviews, {
      fields: [repairRequests.id],
      references: [reviews.repairRequestId],
    }),
    notifications: many(notifications),
  }),
);

export const repairPhotoRelations = relations(repairPhotos, ({ one }) => ({
  repairRequest: one(repairRequests, {
    fields: [repairPhotos.repairRequestId],
    references: [repairRequests.id],
  }),
  uploader: one(user, {
    fields: [repairPhotos.uploadedBy],
    references: [user.id],
  }),
}));

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  repairRequest: one(repairRequests, {
    fields: [statusHistory.repairRequestId],
    references: [repairRequests.id],
  }),
  changedByUser: one(user, {
    fields: [statusHistory.changedBy],
    references: [user.id],
  }),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  repairRequest: one(repairRequests, {
    fields: [payments.repairRequestId],
    references: [repairRequests.id],
  }),
  customer: one(user, {
    fields: [payments.customerId],
    references: [user.id],
  }),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  repairRequest: one(repairRequests, {
    fields: [reviews.repairRequestId],
    references: [repairRequests.id],
  }),
  customer: one(user, {
    fields: [reviews.customerId],
    references: [user.id],
  }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
  repairRequest: one(repairRequests, {
    fields: [notifications.repairRequestId],
    references: [repairRequests.id],
  }),
}));

// ---------------------------------------------------------------------------
// Type exports (inferred from schema)
// ---------------------------------------------------------------------------

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

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
