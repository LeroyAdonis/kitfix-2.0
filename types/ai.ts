/** AI damage assessment result from NVIDIA vision model */
export interface AIDamageAssessment {
  damageType: string;
  severity: "minor" | "moderate" | "severe";
  affectedArea: string;
  repairability: "easy" | "moderate" | "difficult";
  confidence: number;
  description?: string;
  rawResponse?: string;
}

/** AI-generated cost estimate in ZAR cents */
export interface AICostEstimate {
  minCost: number;
  maxCost: number;
  basedOn: string;
  disclaimer: string;
}

/** Structured data extracted from natural language repair description */
export interface SmartRepairExtraction {
  jerseyDescription: string;
  jerseyBrand: string | null;
  jerseySize: string | null;
  damageType: string;
  damageDescription: string;
  urgencyLevel: string;
  shippingAddress?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  } | null;
  confidence: number;
  missingInfo: string[];
}
