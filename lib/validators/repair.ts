import { z } from "zod";

const jerseySizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

const damageTypes = [
  "tear", "hole", "stain", "fading", "logo_damage", "seam_split", "other",
] as const;

const urgencyLevels = ["standard", "rush", "emergency"] as const;

export const shippingAddressSchema = z.object({
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postalCode: z.string().min(4, "Postal code is required").max(10),
  country: z.string().default("South Africa"),
});

export const createRepairSchema = z.object({
  jerseyDescription: z.string().min(10, "Description must be at least 10 characters").max(500),
  jerseyBrand: z.string().max(100).optional(),
  jerseySize: z.enum(jerseySizes),
  damageType: z.enum(damageTypes),
  damageDescription: z.string().min(20, "Please describe the damage in at least 20 characters").max(1000),
  urgencyLevel: z.enum(urgencyLevels).default("standard"),
  shippingAddress: shippingAddressSchema,
});

export type CreateRepairInput = z.infer<typeof createRepairSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const sendQuoteSchema = z.object({
  repairId: z.string().min(1, "Repair ID is required"),
  estimatedCost: z.number().int().positive("Estimated cost must be positive"),
  adminNotes: z.string().max(1000).optional(),
});

export const declineQuoteSchema = z.object({
  repairId: z.string().min(1, "Repair ID is required"),
  reason: z.string().min(10, "Please provide at least 10 characters explaining why").max(500),
});

export const acceptQuoteSchema = z.object({
  repairId: z.string().min(1, "Repair ID is required"),
});
