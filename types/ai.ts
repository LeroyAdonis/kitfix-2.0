/** AI damage assessment result from Puter.js vision analysis */
export interface AIDamageAssessment {
  damageType: string;
  severity: "minor" | "moderate" | "severe";
  affectedArea: string;
  repairability: "easy" | "moderate" | "difficult";
  confidence: number;
  rawResponse?: string;
}

/** AI-generated cost estimate in ZAR cents */
export interface AICostEstimate {
  minCost: number;
  maxCost: number;
  basedOn: string;
  disclaimer: string;
}
