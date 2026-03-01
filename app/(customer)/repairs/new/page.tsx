import { RepairRequestForm } from "@/components/forms/repair-request-form";

export default function NewRepairPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Repair Request</h1>
        <p className="text-muted-foreground">
          Tell us about your jersey and the damage. We&apos;ll get it sorted!
        </p>
      </div>
      <RepairRequestForm />
    </div>
  );
}
