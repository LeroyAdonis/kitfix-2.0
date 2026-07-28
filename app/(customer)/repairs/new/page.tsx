import { SmartRepairForm } from "@/components/forms/smart-repair-form";

export default function NewRepairPage() {
  return (
    <div className="space-y-8">
      {/* Editorial header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-green-400/40" />
          <p className="text-xs font-semibold tracking-widest text-green-400 uppercase">New Request</p>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-content">Submit a Repair</h1>
        <p className="mt-1 text-sm text-content-secondary">Tell us about your jersey and we&apos;ll take it from there.</p>
      </div>
      <SmartRepairForm />
    </div>
  );
}
