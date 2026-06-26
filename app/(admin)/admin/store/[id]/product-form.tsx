"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProduct, updateProduct } from "@/actions/admin-store";

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "Kids S", "Kids M", "Kids L"];

const CATEGORIES = ["jerseys", "shorts", "socks", "training", "accessories", "other"];

const FIELD_TYPES = ["text", "number", "select"];

interface VariantInput {
  size: string;
  stock: number;
  priceModifier: number;
}

interface PersonalizationInput {
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
  maxLength: number | null;
  options: string[] | null;
}

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    description: string;
    slug: string;
    basePrice: number;
    category: string;
    imageUrl: string | null;
    variants: { id: string; size: string; stock: number; priceModifier: number }[];
    personalizationOptions: { id: string; fieldName: string; fieldType: string; isRequired: boolean; maxLength: number | null; options: unknown }[];
  };
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [basePrice, setBasePrice] = useState(product?.basePrice?.toString() ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants.map((v) => ({ size: v.size, stock: v.stock, priceModifier: v.priceModifier })) ?? [],
  );

  const [personalizationFields, setPersonalizationFields] = useState<PersonalizationInput[]>(
    product?.personalizationOptions.map((p) => ({
      fieldName: p.fieldName,
      fieldType: p.fieldType,
      isRequired: p.isRequired,
      maxLength: p.maxLength,
      options: Array.isArray(p.options) ? (p.options as string[]) : null,
    })) ?? [],
  );

  function handleNameChange(value: string) {
    setName(value);
    if (!isEditing) {
      setSlug(toSlug(value));
    }
  }

  function addVariant() {
    setVariants([...variants, { size: "", stock: 0, priceModifier: 0 }]);
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, field: keyof VariantInput, value: string | number) {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  }

  function addPersonalizationField() {
    setPersonalizationFields([
      ...personalizationFields,
      { fieldName: "", fieldType: "text", isRequired: false, maxLength: null, options: null },
    ]);
  }

  function removePersonalizationField(index: number) {
    setPersonalizationFields(personalizationFields.filter((_, i) => i !== index));
  }

  function updatePersonalizationField(index: number, field: keyof PersonalizationInput, value: unknown) {
    const updated = [...personalizationFields];
    updated[index] = { ...updated[index], [field]: value };
    setPersonalizationFields(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = parseInt(basePrice, 10);
    if (isNaN(price) || price <= 0) {
      setError("Base price must be greater than 0");
      return;
    }

    if (variants.length === 0) {
      setError("At least one variant is required");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);

    const payload = {
      name,
      description,
      slug,
      basePrice: price,
      category,
      imageUrl: imageUrl || undefined,
      variants: variants.map((v) => ({
        size: v.size,
        stock: v.stock,
        priceModifier: v.priceModifier,
      })),
      personalizationOptions: personalizationFields.length > 0
        ? personalizationFields.map((p) => ({
            fieldName: p.fieldName,
            fieldType: p.fieldType,
            isRequired: p.isRequired,
            maxLength: p.maxLength ?? undefined,
            options: p.options ?? undefined,
          }))
        : undefined,
    };

    const result = isEditing
      ? await updateProduct(product.id, payload)
      : await createProduct(payload);

    if (result.success) {
      router.push("/admin/store");
      router.refresh();
    } else {
      setError(result.error);
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Basic fields */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Home Jersey 2025"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="home-jersey-2025"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Product description..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base Price (cents)</Label>
            <Input
              id="basePrice"
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="50000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Variants</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="mr-1 h-4 w-4" />
            Add Size
          </Button>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No variants added yet.</p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="flex items-end gap-3 rounded-md border p-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Size</Label>
                    <Select
                      value={v.size}
                      onValueChange={(val) => updateVariant(i, "size", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Stock</Label>
                    <Input
                      type="number"
                      value={v.stock}
                      onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-28 space-y-1">
                    <Label className="text-xs">Price Modifier</Label>
                    <Input
                      type="number"
                      value={v.priceModifier}
                      onChange={(e) => updateVariant(i, "priceModifier", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personalization Options */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personalization Options</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addPersonalizationField}>
            <Plus className="mr-1 h-4 w-4" />
            Add Field
          </Button>
        </CardHeader>
        <CardContent>
          {personalizationFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No personalization fields configured.
            </p>
          ) : (
            <div className="space-y-3">
              {personalizationFields.map((f, i) => (
                <div key={i} className="rounded-md border p-3">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Field Name</Label>
                      <Input
                        value={f.fieldName}
                        onChange={(e) => updatePersonalizationField(i, "fieldName", e.target.value)}
                        placeholder="e.g. Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={f.fieldType}
                        onValueChange={(val) => updatePersonalizationField(i, "fieldType", val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map((t) => (
                            <SelectItem key={t} value={t} className="capitalize">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Length</Label>
                      <Input
                        type="number"
                        value={f.maxLength ?? ""}
                        onChange={(e) =>
                          updatePersonalizationField(
                            i,
                            "maxLength",
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={f.isRequired}
                          onChange={(e) => updatePersonalizationField(i, "isRequired", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        Required
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePersonalizationField(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {f.fieldType === "select" && (
                    <div className="mt-2 space-y-1">
                      <Label className="text-xs">Options (comma-separated)</Label>
                      <Input
                        value={(f.options ?? []).join(", ")}
                        onChange={(e) =>
                          updatePersonalizationField(
                            i,
                            "options",
                            e.target.value
                              ? e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                              : null,
                          )
                        }
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/store")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
