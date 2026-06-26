"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PersonalizationOption {
  id: string;
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
  maxLength: number | null;
  options: string[] | null;
}

interface PersonalizationFieldsProps {
  options: PersonalizationOption[];
  values: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
  errors: Record<string, string>;
}

export function PersonalizationFields({ options, values, onChange, errors }: PersonalizationFieldsProps) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Personalization</h3>
      {options.map((opt) => {
        const error = errors[opt.fieldName];

        if (opt.fieldType === "select" && opt.options) {
          return (
            <div key={opt.id} className="space-y-1.5">
              <Label>
                {opt.fieldName.charAt(0).toUpperCase() + opt.fieldName.slice(1)}
                {opt.isRequired && <span className="ml-1 text-destructive">*</span>}
              </Label>
              <Select
                value={values[opt.fieldName] ?? ""}
                onValueChange={(v) => onChange(opt.fieldName, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${opt.fieldName}`} />
                </SelectTrigger>
                <SelectContent>
                  {opt.options.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          );
        }

        return (
          <div key={opt.id} className="space-y-1.5">
            <Label>
              {opt.fieldName.charAt(0).toUpperCase() + opt.fieldName.slice(1)}
              {opt.isRequired && <span className="ml-1 text-destructive">*</span>}
            </Label>
            <Input
              value={values[opt.fieldName] ?? ""}
              onChange={(e) => onChange(opt.fieldName, e.target.value)}
              maxLength={opt.maxLength ?? undefined}
              placeholder={`Enter ${opt.fieldName}`}
            />
            {opt.maxLength && (
              <p className="text-xs text-muted-foreground">
                {(values[opt.fieldName] ?? "").length}/{opt.maxLength}
              </p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );
      })}
    </div>
  );
}
