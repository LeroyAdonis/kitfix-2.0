"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { AIDamageAssessment, AICostEstimate } from "@/types/ai";

/** Base repair costs in ZAR cents */
const BASE_COST: Record<string, number> = {
  minor: 15_000,
  moderate: 30_000,
  severe: 50_000,
};

/** Urgency multipliers */
const URGENCY_MULTIPLIER: Record<string, number> = {
  standard: 1.0,
  rush: 1.5,
  emergency: 2.0,
};

const DISCLAIMER = "This is an AI estimate only. Final cost will be set by our repair team.";

function calculateEstimate(
  assessment: AIDamageAssessment,
  urgencyLevel: string,
): AICostEstimate {
  const base = BASE_COST[assessment.severity] ?? BASE_COST.moderate;
  const urgency = URGENCY_MULTIPLIER[urgencyLevel] ?? URGENCY_MULTIPLIER.standard;

  return {
    minCost: Math.round(base * 0.8 * urgency),
    maxCost: Math.round(base * 1.2 * urgency),
    basedOn: `${assessment.severity} ${assessment.damageType} with ${urgencyLevel} urgency`,
    disclaimer: DISCLAIMER,
  };
}

interface CostEstimatorProps {
  assessment: AIDamageAssessment | null;
  urgencyLevel: string;
}

export function CostEstimator({ assessment, urgencyLevel }: CostEstimatorProps) {
  if (!assessment) {
    return null;
  }

  const estimate = calculateEstimate(assessment, urgencyLevel);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Estimated Cost
        </CardTitle>
        <CardDescription>
          Based on AI damage assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">
            {formatCurrency(estimate.minCost)}
          </span>
          <span className="text-muted-foreground">—</span>
          <span className="text-2xl font-bold">
            {formatCurrency(estimate.maxCost)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {assessment.severity}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {urgencyLevel}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">{estimate.disclaimer}</p>
      </CardContent>
    </Card>
  );
}

