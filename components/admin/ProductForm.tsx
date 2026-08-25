"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "Kids"] as const;
const CATEGORIES = ["jersey", "accessory", "other"] as const;

interface Variant {
  _id?: Id<"productVariants">;
  size: string;
  stock: number;
  priceModifier: number;
}

interface PersonalizationOption {
  _id?: Id<"personalizationOptions">;
  label: string;
  type: "text" | "select";
  required: boolean;
  maxLength?: number;
  options?: string[];
}

interface ProductFormData {
  _id: Id<"products">;
  name: string;
  description: string;
  slug: string;
  category: "jersey" | "accessory" | "other";
  basePrice: number;
  imageUrl?: string;
  variants: Variant[];
  personalizationOptions: PersonalizationOption[];
}

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: ProductFormData;
}

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter();
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState<"jersey" | "accessory" | "other">(
    initialData?.category ?? "jersey",
  );
  const [basePrice, setBasePrice] = useState(
    initialData ? String(initialData.basePrice / 100) : "",
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [variants, setVariants] = useState<Variant[]>(
    initialData?.variants ?? [],
  );
  const [personalizationOptions, setPersonalizationOptions] = useState<
    PersonalizationOption[]
  >(initialData?.personalizationOptions ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Slug is derived at render time: the Convex mutations auto-generate and
  // own the slug from the product name (collision-safe), so the form shows a
  // read-only preview rather than a dead editable field.
  const derivedSlug = nameToSlug(name) || initialData?.slug || "";

  // ── Variants ──
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { size: "M", stock: 0, priceModifier: 0 },
    ]);
  };
  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };
  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string | number,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, [field]: value } : v,
      ),
    );
  };

  // ── Personalization options ──
  const addOption = () => {
    setPersonalizationOptions((prev) => [
      ...prev,
      { label: "", type: "text", required: false },
    ]);
  };
  const removeOption = (index: number) => {
    setPersonalizationOptions((prev) => prev.filter((_, i) => i !== index));
  };
  const updateOption = (
    index: number,
    field: keyof PersonalizationOption,
    value: unknown,
  ) => {
    setPersonalizationOptions((prev) =>
      prev.map((o, i) =>
        i === index ? { ...o, [field]: value } : o,
      ),
    );
  };

  // ── Validation & Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const priceCents = Math.round(parseFloat(basePrice) * 100);
    if (!basePrice || isNaN(priceCents) || priceCents <= 0) {
      newErrors.basePrice = "Price must be greater than R0";
    }
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (variants.length === 0) {
      newErrors.variants = "At least one variant is required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const variantData = variants.map((v) => ({
        _id: v._id,
        size: v.size,
        stock: v.stock,
        priceModifier: v.priceModifier,
      }));
      const optionData = personalizationOptions.map((o) => ({
        _id: o._id,
        label: o.label,
        type: o.type,
        required: o.required,
        maxLength: o.maxLength || undefined,
        options: o.type === "select" && o.options?.length ? o.options : undefined,
      }));

      if (mode === "create") {
        await createProduct({
          name,
          description,
          basePrice: priceCents,
          category,
          imageUrl: imageUrl || undefined,
          variants: variantData.map((v) => ({
            size: v.size,
            stock: v.stock,
            priceModifier: v.priceModifier,
          })),
          personalizationOptions: optionData.map((o) => ({
            label: o.label,
            type: o.type,
            required: o.required,
            maxLength: o.maxLength,
            options: o.options,
          })),
        });
      } else {
        await updateProduct({
          id: initialData!._id,
          name,
          description,
          basePrice: priceCents,
          category,
          imageUrl: imageUrl || undefined,
          variants: variantData,
          personalizationOptions: optionData,
        });
      }
      router.push("/admin/store");
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "w-full bg-[var(--color-pitch-deep)] text-[var(--color-thread)] border border-[var(--color-pitch-line)]/50 px-3 py-2 text-sm focus:border-[var(--color-stitch)] outline-none font-body";
  const labelClasses =
    "block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-thread-dim)] mb-1";
  const sectionHeaderClasses =
    "flex items-center gap-2 mb-4 mt-8";
  const sectionTitleClasses =
    "font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stitch)]";
  const errorClasses =
    "font-mono text-xs text-[var(--color-foul)] mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="border border-[var(--color-foul)]/40 bg-[var(--color-foul)]/10 p-3">
          <p className={errorClasses}>{errors.submit}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="border border-[var(--color-pitch-line)]/40 bg-[var(--color-pitch)]/15 p-5">
        <div className={sectionHeaderClasses}>
          <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
          <h3 className={sectionTitleClasses}>Product Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClasses}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Slug (auto-generated)</label>
            <input
              type="text"
              value={derivedSlug}
              readOnly
              className={`${inputClasses} opacity-60 cursor-not-allowed`}
            />
            <p className="font-mono text-[10px] text-[var(--color-thread-dim)] mt-1">
              Auto-generated from name — set by the server on save.
            </p>
          </div>
          <div>
            <label className={labelClasses}>Category</label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as typeof category)
              }
              className={inputClasses}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Base Price (R)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className={inputClasses}
              placeholder="0.00"
            />
            {errors.basePrice && (
              <p className={errorClasses}>{errors.basePrice}</p>
            )}
          </div>
          <div>
            <label className={labelClasses}>Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputClasses}
              placeholder="https://..."
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClasses}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClasses} h-24 resize-none`}
            />
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="border border-[var(--color-pitch-line)]/40 bg-[var(--color-pitch)]/15 p-5">
        <div className={sectionHeaderClasses}>
          <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
          <h3 className={sectionTitleClasses}>Variants</h3>
        </div>
        {errors.variants && <p className={errorClasses}>{errors.variants}</p>}
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div
              key={i}
              className="flex items-end gap-3 flex-wrap border border-[var(--color-pitch-line)]/20 p-3"
            >
              <div className="flex-1 min-w-[100px]">
                <label className={labelClasses}>Size</label>
                <select
                  value={v.size}
                  onChange={(e) => updateVariant(i, "size", e.target.value)}
                  className={inputClasses}
                >
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[100px]">
                <label className={labelClasses}>Stock</label>
                <input
                  type="number"
                  min="0"
                  value={v.stock}
                  onChange={(e) =>
                    updateVariant(i, "stock", parseInt(e.target.value) || 0)
                  }
                  className={inputClasses}
                />
              </div>
              <div className="flex-1 min-w-[100px]">
                <label className={labelClasses}>Price Modifier (R)</label>
                <input
                  type="number"
                  step="0.01"
                  value={v.priceModifier / 100}
                  onChange={(e) =>
                    updateVariant(
                      i,
                      "priceModifier",
                      Math.round(parseFloat(e.target.value || "0") * 100),
                    )
                  }
                  className={inputClasses}
                />
              </div>
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="px-3 py-2 border border-[var(--color-foul)]/40 text-[var(--color-foul)] font-mono text-xs uppercase tracking-wider hover:bg-[var(--color-foul)]/10 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="mt-3 px-4 py-2 border border-[var(--color-pitch-line)]/40 text-[var(--color-thread-dim)] font-mono text-xs uppercase tracking-wider hover:border-[var(--color-stitch)] hover:text-[var(--color-stitch)] transition-colors"
        >
          + Add Variant
        </button>
      </div>

      {/* Personalization Options */}
      <div className="border border-[var(--color-pitch-line)]/40 bg-[var(--color-pitch)]/15 p-5">
        <div className={sectionHeaderClasses}>
          <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
          <h3 className={sectionTitleClasses}>Personalization Options</h3>
        </div>
        <div className="space-y-3">
          {personalizationOptions.map((opt, i) => (
            <div
              key={i}
              className="border border-[var(--color-pitch-line)]/20 p-3 space-y-3"
            >
              <div className="flex items-end gap-3 flex-wrap">
                <div className="flex-1 min-w-[150px]">
                  <label className={labelClasses}>Label</label>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => updateOption(i, "label", e.target.value)}
                    className={inputClasses}
                    placeholder="e.g. Name, Number"
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className={labelClasses}>Type</label>
                  <select
                    value={opt.type}
                    onChange={(e) =>
                      updateOption(i, "type", e.target.value as "text" | "select")
                    }
                    className={inputClasses}
                  >
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    checked={opt.required}
                    onChange={(e) =>
                      updateOption(i, "required", e.target.checked)
                    }
                    className="accent-[var(--color-stitch)]"
                    id={`opt-req-${i}`}
                  />
                  <label
                    htmlFor={`opt-req-${i}`}
                    className="font-mono text-xs text-[var(--color-thread-dim)]"
                  >
                    Required
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="px-3 py-2 border border-[var(--color-foul)]/40 text-[var(--color-foul)] font-mono text-xs uppercase tracking-wider hover:bg-[var(--color-foul)]/10 transition-colors"
                >
                  Remove
                </button>
              </div>
              {opt.type === "text" && (
                <div>
                  <label className={labelClasses}>Max Length</label>
                  <input
                    type="number"
                    min="1"
                    value={opt.maxLength ?? ""}
                    onChange={(e) =>
                      updateOption(
                        i,
                        "maxLength",
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    className={`${inputClasses} max-w-[150px]`}
                    placeholder="No limit"
                  />
                </div>
              )}
              {opt.type === "select" && (
                <div>
                  <label className={labelClasses}>
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={opt.options?.join(", ") ?? ""}
                    onChange={(e) =>
                      updateOption(
                        i,
                        "options",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    className={inputClasses}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOption}
          className="mt-3 px-4 py-2 border border-[var(--color-pitch-line)]/40 text-[var(--color-thread-dim)] font-mono text-xs uppercase tracking-wider hover:border-[var(--color-stitch)] hover:text-[var(--color-stitch)] transition-colors"
        >
          + Add Option
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[var(--color-stitch)] text-[var(--color-ink)] font-mono text-xs uppercase tracking-[0.18em] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Update Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/store")}
          className="px-6 py-2.5 border border-[var(--color-pitch-line)]/40 text-[var(--color-thread-dim)] font-mono text-xs uppercase tracking-[0.18em] hover:border-[var(--color-stitch)] hover:text-[var(--color-stitch)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
