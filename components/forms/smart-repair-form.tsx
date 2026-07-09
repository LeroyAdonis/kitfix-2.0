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
import { Card, CardContent } from "@/components/ui/card";
import { createRepairAction } from "@/actions/repairs";
import { extractRepairAction } from "@/actions/ai-extract-repair";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Sparkles,
  Upload,
  X,
  ImageIcon,
  CheckCircle2,
  Edit3,
  Send,
  ChevronDown,
} from "lucide-react";
import type { SmartRepairExtraction } from "@/types/ai";

const MAX_PHOTOS = 5;
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

const SA_PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng",
  "KwaZulu-Natal", "Limpopo", "Mpumalanga",
  "Northern Cape", "North West", "Western Cape",
] as const;

type FlowStep = "describe" | "analyzing" | "review" | "submitting";

export function SmartRepairForm() {
  const router = useRouter();
  const router2 = useRouter();
  const [flowStep, setFlowStep] = useState<FlowStep>("describe");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [extraction, setExtraction] = useState<SmartRepairExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable form fields (pre-filled from AI extraction)
  const [jerseyDescription, setJerseyDescription] = useState("");
  const [jerseyBrand, setJerseyBrand] = useState("");
  const [jerseySize, setJerseySize] = useState("");
  const [damageType, setDamageType] = useState("");
  const [damageDescription, setDamageDescription] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("standard");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // ── Photo handling ──────────────────────────────────────────────────

  const addFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const files = Array.from(incoming);
      const remaining = MAX_PHOTOS - selectedFiles.length;
      if (remaining <= 0) return;

      const accepted = files
        .filter((f) => ACCEPTED_IMAGE_TYPES.split(",").includes(f.type) && f.size <= 10 * 1024 * 1024)
        .slice(0, remaining);

      if (accepted.length === 0) return;

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
      setPhotoUrls((prev) => [...prev, ...dataUrls]);
    },
    [selectedFiles.length],
  );

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  }

  // ── AI Analysis ─────────────────────────────────────────────────────

  async function handleAnalyze() {
    if (!description.trim()) {
      setError("Please describe what needs fixing on your jersey.");
      return;
    }

    setError(null);
    setFlowStep("analyzing");

    try {
      const result = await extractRepairAction(description, selectedFiles.length);

      if (!result.success) {
        setError(result.error);
        setFlowStep("describe");
        return;
      }

      const data = result.data;
      setExtraction(data);

      // Pre-fill editable fields
      setJerseyDescription(data.jerseyDescription);
      setJerseyBrand(data.jerseyBrand ?? "");
      setJerseySize(data.jerseySize ?? "");
      setDamageType(data.damageType);
      setDamageDescription(data.damageDescription);
      setUrgencyLevel(data.urgencyLevel);

      setFlowStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed unexpectedly.");
      setFlowStep("describe");
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────

  function handleSubmit() {
    setError(null);
    setFlowStep("submitting");

    startTransition(async () => {
      const fd = new globalThis.FormData();
      fd.set("jerseyDescription", jerseyDescription);
      if (jerseyBrand) fd.set("jerseyBrand", jerseyBrand);
      fd.set("jerseySize", jerseySize || "M");
      fd.set("damageType", damageType);
      fd.set("damageDescription", damageDescription);
      fd.set("urgencyLevel", urgencyLevel);
      fd.set("street", street);
      fd.set("city", city);
      fd.set("province", province);
      fd.set("postalCode", postalCode);
      fd.set("country", "South Africa");

      if (extraction) {
        fd.set("aiDamageAssessment", JSON.stringify(extraction));
      }

      const result = await createRepairAction(fd);

      if (result.success) {
        // Upload photos in the background
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
        setFlowStep("review");
      }
    });
  }

  // ── Go back to edit description ─────────────────────────────────────

  function handleRedescribe() {
    setFlowStep("describe");
    setExtraction(null);
    setError(null);
  }

  // ── File upload triggers ───────────────────────────────────────────

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

  // ── Damage type labels ─────────────────────────────────────────────

  const DAMAGE_TYPES = [
    { value: "tear", label: "Tear" },
    { value: "hole", label: "Hole" },
    { value: "stain", label: "Stain" },
    { value: "fading", label: "Fading" },
    { value: "logo_damage", label: "Logo Damage" },
    { value: "seam_split", label: "Seam Split" },
    { value: "other", label: "Other" },
  ];

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ════════ STEP 1: Describe ════════ */}
      {flowStep === "describe" && (
        <div className="space-y-6">
          {/* Hero area */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-gold/10 px-4 py-1.5 text-sm font-medium text-brand-gold">
              <Sparkles className="h-4 w-4" />
              AI-Powered
            </div>
            <h1 className="text-2xl font-bold">What needs fixing?</h1>
            <p className="text-muted-foreground">
              Describe your jersey and what&apos;s wrong — our AI will handle the rest.
            </p>
          </div>

          {/* Description input */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">
              Describe your repair
            </Label>
            <Textarea
              id="description"
              placeholder="e.g. My Orlando Pirates 2024 home jersey size L has a tear on the right sleeve near the Adidas logo. The black fabric is split about 3cm. I need it done ASAP for an upcoming match."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="resize-y text-base"
            />
            <p className="text-xs text-muted-foreground">
              Include: jersey details, what&apos;s damaged, and urgency. The more detail, the better!
            </p>
          </div>

          {/* Photo upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4" />
              Photos <span className="text-sm font-normal text-muted-foreground">(optional, helps AI assess better)</span>
              <span className="text-sm font-normal text-muted-foreground ml-auto">
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
                <p className="text-sm font-medium">Drag photos here or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, or WebP — helps AI assess damage more accurately
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
                      src={photoUrls[index] ?? ""}
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

          {/* Analyze button */}
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={!description.trim() || isPending}
            size="lg"
            className="w-full gap-2 text-base"
          >
            <Sparkles className="h-5 w-5" />
            Analyze with AI ✨
          </Button>

          {/* Quick tips */}
          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">💡 Quick tips</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Mention jersey team, year, and colors</li>
                <li>• Describe the damage location and size</li>
                <li>• Include size if you know it</li>
                <li>• Say if it&apos;s urgent</li>
                <li className="text-brand-gold font-medium">• Photos help AI assess damage & cost</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════ STEP 2: Analyzing ════════ */}
      {flowStep === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-brand-gold animate-pulse" />
            </div>
            <Loader2 className="h-16 w-16 animate-spin text-muted-foreground/30" />
          </div>
          <p className="text-lg font-semibold">AI is analyzing your repair...</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Extracting jersey details, damage info, and urgency from your description
          </p>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-brand-gold/40 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 rounded-full bg-brand-gold/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 rounded-full bg-brand-gold/80 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {/* ════════ STEP 3: Review ════════ */}
      {flowStep === "review" && extraction && (
        <div className="space-y-6">
          {/* Success banner */}
          <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">
                AI analyzed your repair!
              </p>
              <p className="text-xs text-muted-foreground">
                Review the details below and edit if needed. Confidence: {Math.round(extraction.confidence * 100)}%
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRedescribe}
              className="ml-auto shrink-0"
            >
              <Edit3 className="mr-1 h-4 w-4" />
              Redescribe
            </Button>
          </div>

          {/* Missing info alert */}
          {extraction.missingInfo.length > 0 && (
            <Alert>
              <AlertDescription className="text-sm">
                ℹ️ Consider adding: <strong>{extraction.missingInfo.join(", ")}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Jersey Details */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-brand-gold/10 text-brand-gold border-brand-gold/20">1</Badge>
                Jersey Details
              </h3>

              <div className="space-y-2">
                <Label htmlFor="smart-jersey" className="text-xs text-muted-foreground">Jersey Description</Label>
                <Textarea
                  id="smart-jersey"
                  value={jerseyDescription}
                  onChange={(e) => setJerseyDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smart-brand" className="text-xs text-muted-foreground">Brand</Label>
                  <Input
                    id="smart-brand"
                    placeholder="e.g. Adidas"
                    value={jerseyBrand}
                    onChange={(e) => setJerseyBrand(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smart-size" className="text-xs text-muted-foreground">Size</Label>
                  <Select value={jerseySize} onValueChange={setJerseySize}>
                    <SelectTrigger id="smart-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Damage Info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-brand-gold/10 text-brand-gold border-brand-gold/20">2</Badge>
                Damage Info
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smart-damage-type" className="text-xs text-muted-foreground">Damage Type</Label>
                  <Select value={damageType} onValueChange={setDamageType}>
                    <SelectTrigger id="smart-damage-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAMAGE_TYPES.map((dt) => (
                        <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smart-urgency" className="text-xs text-muted-foreground">Urgency</Label>
                  <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                    <SelectTrigger id="smart-urgency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (7-14 days)</SelectItem>
                      <SelectItem value="rush">Rush (3-5 days)</SelectItem>
                      <SelectItem value="emergency">Emergency (1-2 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smart-damage-desc" className="text-xs text-muted-foreground">Damage Description</Label>
                <Textarea
                  id="smart-damage-desc"
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline">3</Badge>
                Shipping Address
              </h3>
              <p className="text-xs text-muted-foreground">
                Where should we ship the repaired jersey back to?
              </p>

              <div className="space-y-2">
                <Label htmlFor="smart-street" className="text-xs text-muted-foreground">Street Address</Label>
                <Input
                  id="smart-street"
                  placeholder="e.g. 123 Main Road, Sandton"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="smart-city" className="text-xs text-muted-foreground">City</Label>
                  <Input
                    id="smart-city"
                    placeholder="e.g. Johannesburg"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smart-province" className="text-xs text-muted-foreground">Province</Label>
                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger id="smart-province">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {SA_PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smart-postal" className="text-xs text-muted-foreground">Postal Code</Label>
                  <Input
                    id="smart-postal"
                    placeholder="e.g. 2196"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    maxLength={10}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos preview */}
          {selectedFiles.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">Photos ({selectedFiles.length})</h3>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoUrls[index] ?? ""}
                        alt={file.name}
                        className="h-full w-full rounded-md border object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !jerseyDescription || !damageType || !street || !city || !province}
            size="lg"
            className="w-full gap-2 text-base"
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting Repair Request...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Repair Request
              </>
            )}
          </Button>
        </div>
      )}

      {/* ════════ STEP 4: Submitting ════════ */}
      {flowStep === "submitting" && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-brand-gold" />
          <p className="text-lg font-semibold">Submitting your repair...</p>
          <p className="text-sm text-muted-foreground">Just a moment while we process everything</p>
        </div>
      )}
    </div>
  );
}
