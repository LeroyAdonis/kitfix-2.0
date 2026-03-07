"use client";

import { useState, useTransition, useRef, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { DamageAnalyzer } from "@/components/ai/damage-analyzer";
import { CostEstimator } from "@/components/ai/cost-estimator";
import { createRepairAction } from "@/actions/repairs";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { Loader2, ChevronLeft, ChevronRight, Send, SkipForward, Upload, X, ImageIcon } from "lucide-react";
import type { DamageType, UrgencyLevel } from "@/types";
import type { AIDamageAssessment } from "@/types/ai";

const MAX_PHOTOS = 5;
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

const STEPS = [
  "Jersey Details",
  "Damage Info",
  "AI Assessment",
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
  photoUrls: string[];
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
  photoUrls: [],
  street: "",
  city: "",
  province: "",
  postalCode: "",
};

export function RepairRequestForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<RepairFormData>(initialFormData);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [aiAssessment, setAiAssessment] = useState<AIDamageAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateField(field: keyof RepairFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  // ── Photo selection helpers ────────────────────────────────────────────
  const addFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const files = Array.from(incoming);
      const remaining = MAX_PHOTOS - selectedFiles.length;
      if (remaining <= 0) return;

      const accepted = files
        .filter((f) => ACCEPTED_IMAGE_TYPES.split(",").includes(f.type) && f.size <= 10 * 1024 * 1024)
        .slice(0, remaining);

      if (accepted.length === 0) return;

      // Read all files in parallel, preserving order with Promise.all
      const dataUrls = await Promise.all(
        accepted.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file);
            }),
        ),
      );

      setSelectedFiles((prev) => [...prev, ...accepted]);
      setFormData((prev) => ({
        ...prev,
        photoUrls: [...prev.photoUrls, ...dataUrls],
      }));
    },
    [selectedFiles.length],
  );

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, i) => i !== index),
    }));
  }

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (selectedFiles.length < MAX_PHOTOS) setIsDragOver(true);
    },
    [selectedFiles.length],
  );

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

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
    } else if (stepIndex === 3) {
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

      if (aiAssessment) {
        fd.set("aiDamageAssessment", JSON.stringify(aiAssessment));
      }

      const result = await createRepairAction(fd);

      if (result.success) {
        // Upload selected photos in the background — don't block on failures
        const repairId = result.data.id;
        for (const file of selectedFiles) {
          try {
            const uploadFd = new globalThis.FormData();
            uploadFd.set("file", file);
            uploadFd.set("repairRequestId", repairId);
            uploadFd.set("photoType", "before");
            await fetch("/api/upload", { method: "POST", body: uploadFd });
          } catch (uploadErr) {
            logger.warn("Photo upload failed after form submission", {
              repairId,
              fileName: file.name,
              error: uploadErr instanceof Error ? uploadErr.message : String(uploadErr),
            });
          }
        }
        router.push(`/repairs/${repairId}`);
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

          {/* Photo upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photos (optional)
              <span className="text-muted-foreground text-sm font-normal">
                {selectedFiles.length}/{MAX_PHOTOS}
              </span>
            </Label>

            {selectedFiles.length < MAX_PHOTOS && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                )}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, or WebP — max {MAX_PHOTOS} photos
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  addFiles(e.target.files);
                }
                e.target.value = "";
              }}
            />

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="group relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.photoUrls[index] ?? ""}
                      alt={file.name}
                      className="h-full w-full rounded-md border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: AI Assessment (optional) */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">AI Assessment</h2>
            <p className="text-sm text-muted-foreground">
              Optional — get an AI estimate of damage severity and repair cost.
            </p>
          </div>

          <DamageAnalyzer
            files={selectedFiles}
            photoUrls={formData.photoUrls}
            onAnalysisComplete={setAiAssessment}
          />

          <CostEstimator
            assessment={aiAssessment}
            urgencyLevel={formData.urgencyLevel}
          />
        </div>
      )}

      {/* Step 4: Shipping Address */}
      {step === 3 && (
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

      {/* Step 5: Review & Submit */}
      {step === 4 && (
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

            {aiAssessment && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  AI Assessment
                </h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    {aiAssessment.severity}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {aiAssessment.repairability} repair
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {aiAssessment.affectedArea}
                  </Badge>
                </div>
              </div>
            )}

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

        <div className="flex gap-2">
          {/* AI step gets a Skip button */}
          {step === 2 && (
            <Button type="button" variant="ghost" onClick={handleNext}>
              <SkipForward className="mr-1 h-4 w-4" />
              Skip
            </Button>
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
    </div>
  );
}
