"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateProfileAction } from "@/actions/profile";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  currentName: string;
}

export function ProfileForm({ currentName }: ProfileFormProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());

      const result = await updateProfileAction(formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          disabled={isPending}
        />
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || name.trim().length < 2}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  );
}
