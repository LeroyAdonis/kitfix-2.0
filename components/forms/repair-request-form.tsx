"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createRepairAction } from "@/actions/repairs";
import { Loader2, ChevronLeft, ChevronRight, Send } from "lucide-react";
import type { DamageType, UrgencyLevel } from "@/types";

const STEPS = [
  "Jersey Details",
  "Damage Info",
  "Shipping Address",
  "Review & Submit",
] as const;

const JERSEY_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

const DAMAGE_TYPES: { value: DamageType; label: string }[] = [
  { value: "tear", label: "Tear" },
  { value: "hole", label: "Hole" },
  { value: "stain", label: "Stain" },
  { value: "fading", label: "Fading" },
  { value: "logo_damage", label: "Logo Damage" },
  { value: "seam_split", label: "Seam Split" },
  { value: "other", label: "Other" },
];

const URGENCY_LEVELS: {
  value: UrgencyLevel;
  label: string;
  description: string;
}[] = [
  { value: "standard", label: "Standard", description: "7–14 business days" },
  { value: "rush", label: "Rush", description: "3–5 business days" },
  { value: "emergency", label: "Emergency", description: "1–2 business days" },
];

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

interface RepairFormData {
  jerseyDescription: string;
  jerseyBrand: string;
  jerseySize: string;
  damageType: string;
  damageDescription: string;
  urgencyLevel: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

const initialFormData: RepairFormData = {
  jerseyDescription: "",
  jerseyBrand: "",
  jerseySize: "",
  damageType: "",
  damageDescription: "",
  urgencyLevel: "standard",
  street: "",
  city: "",
  province: "",
  postalCode: "",
};

export function RepairRequestForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<RepairFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  function updateField(field: keyof RepairFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateStep(stepIndex: number): boolean {
    const errors: Record<string, string[]> = {};

    if (stepIndex === 0) {
      if (!formData.jerseyDescription.trim()) {
        errors.jerseyDescription = ["Jersey description is required"];
      }
      if (!formData.jerseySize) {
        errors.jerseySize = ["Please select a size"];
      }
    } else if (stepIndex === 1) {
      if (!formData.damageType) {
        errors.damageType = ["Please select a damage type"];
      }
      if (!formData.damageDescription.trim()) {
        errors.damageDescription = ["Please describe the damage"];
      }
    } else if (stepIndex === 2) {
      if (!formData.street.trim()) {
        errors.street = ["Street address is required"];
      }
      if (!formData.city.trim()) {
        errors.city = ["City is required"];
      }
      if (!formData.province) {
        errors.province = ["Province is required"];
      }
      if (!formData.postalCode.trim()) {
        errors.postalCode = ["Postal code is required"];
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    setStep((s) => s - 1);
    setError(null);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const fd = new globalThis.FormData();
      fd.set("jerseyDescription", formData.jerseyDescription);
      if (formData.jerseyBrand) fd.set("jerseyBrand", formData.jerseyBrand);
      fd.set("jerseySize", formData.jerseySize);
      fd.set("damageType", formData.damageType);
      fd.set("damageDescription", formData.damageDescription);
      fd.set("urgencyLevel", formData.urgencyLevel);
      fd.set("street", formData.street);
      fd.set("city", formData.city);
      fd.set("province", formData.province);
      fd.set("postalCode", formData.postalCode);
      fd.set("country", "South Africa");

      const result = await createRepairAction(fd);

      if (result.success) {
        router.push(`/repairs/${result.data.id}`);
      } else {
        setError(result.error);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  }

  function getFieldError(field: string): string | undefined {
    return fieldErrors[field]?.[0];
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicators */}
      <nav aria-label="Form progress" className="mb-8 flex items-center justify-between">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                aria-current={index === step ? "step" : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  index <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <span className="mt-1 hidden text-xs sm:block">{label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${
                  index < step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </nav>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Jersey Details */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Jersey Details</h2>

          <div className="space-y-2">
            <Label htmlFor="jerseyDescription">
              Jersey Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="jerseyDescription"
              placeholder="e.g. Orlando Pirates 2024/25 home jersey, black with white details..."
              value={formData.jerseyDescription}
              onChange={(e) => updateField("jerseyDescription", e.target.value)}
              rows={3}
            />
            {getFieldError("jerseyDescription") && (
              <p className="text-sm text-destructive">
                {getFieldError("jerseyDescription")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jerseyBrand">Brand (optional)</Label>
            <Input
              id="jerseyBrand"
              placeholder="e.g. Adidas, Nike, Puma"
              value={formData.jerseyBrand}
              onChange={(e) => updateField("jerseyBrand", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jerseySize">
              Size <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.jerseySize}
              onValueChange={(val: string) => updateField("jerseySize", val)}
            >
              <SelectTrigger id="jerseySize">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {JERSEY_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("jerseySize") && (
              <p className="text-sm text-destructive">
                {getFieldError("jerseySize")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Damage Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Damage Information</h2>

          <div className="space-y-2">
            <Label htmlFor="damageType">
              Damage Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.damageType}
              onValueChange={(val: string) => updateField("damageType", val)}
            >
              <SelectTrigger id="damageType">
                <SelectValue placeholder="Select damage type" />
              </SelectTrigger>
              <SelectContent>
                {DAMAGE_TYPES.map((dt) => (
                  <SelectItem key={dt.value} value={dt.value}>
                    {dt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("damageType") && (
              <p className="text-sm text-destructive">
                {getFieldError("damageType")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="damageDescription">
              Damage Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="damageDescription"
              placeholder="Describe the damage in detail — location, size, how it happened..."
              value={formData.damageDescription}
              onChange={(e) =>
                updateField("damageDescription", e.target.value)
              }
              rows={4}
            />
            {getFieldError("damageDescription") && (
              <p className="text-sm text-destructive">
                {getFieldError("damageDescription")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Urgency Level</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {URGENCY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => updateField("urgencyLevel", level.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    formData.urgencyLevel === level.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-foreground/20"
                  }`}
                >
                  <p className="text-sm font-medium">{level.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {level.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Shipping Address */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <p className="text-sm text-muted-foreground">
            Where should we ship the repaired jersey back to?
          </p>

          <div className="space-y-2">
            <Label htmlFor="street">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="street"
              placeholder="e.g. 123 Main Road, Sandton"
              value={formData.street}
              onChange={(e) => updateField("street", e.target.value)}
            />
            {getFieldError("street") && (
              <p className="text-sm text-destructive">
                {getFieldError("street")}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="e.g. Johannesburg"
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
              {getFieldError("city") && (
                <p className="text-sm text-destructive">
                  {getFieldError("city")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">
                Province <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.province}
                onValueChange={(val: string) => updateField("province", val)}
              >
                <SelectTrigger id="province">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {SA_PROVINCES.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError("province") && (
                <p className="text-sm text-destructive">
                  {getFieldError("province")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">
              Postal Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="postalCode"
              placeholder="e.g. 2196"
              value={formData.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
              maxLength={10}
            />
            {getFieldError("postalCode") && (
              <p className="text-sm text-destructive">
                {getFieldError("postalCode")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Review & Submit</h2>

          <div className="space-y-4 rounded-lg border p-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Jersey
              </h3>
              <p className="text-sm">{formData.jerseyDescription}</p>
              {formData.jerseyBrand && (
                <p className="text-sm text-muted-foreground">
                  Brand: {formData.jerseyBrand}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Size: {formData.jerseySize}
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Damage
              </h3>
              <p className="text-sm capitalize">
                {formData.damageType.replace("_", " ")}
              </p>
              <p className="text-sm text-muted-foreground">
                {formData.damageDescription}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                Urgency: {formData.urgencyLevel}
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Shipping Address
              </h3>
              <p className="text-sm">{formData.street}</p>
              <p className="text-sm">
                {formData.city}, {formData.province} {formData.postalCode}
              </p>
              <p className="text-sm text-muted-foreground">South Africa</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isPending}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="mr-1 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
