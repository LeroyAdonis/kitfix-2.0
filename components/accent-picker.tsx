"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

const accents = [
  { value: "gold", label: "Gold", class: "bg-[#C8A951]" },
  { value: "green", label: "Green", class: "bg-[#007749]" },
  { value: "orange", label: "Orange", class: "bg-[#FF6B35]" },
  { value: "blue", label: "Blue", class: "bg-[#3B82F6]" },
  { value: "purple", label: "Purple", class: "bg-[#8B5CF6]" },
] as const;

export function AccentPicker() {
  const [mounted, setMounted] = useState(false);
  const [accent, setAccent] = useState("gold");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("kitfix-accent");
    if (saved) {
      setAccent(saved);
      document.documentElement.setAttribute("data-accent", saved);
    }
  }, []);

  function select(value: string) {
    setAccent(value);
    localStorage.setItem("kitfix-accent", value);
    document.documentElement.setAttribute("data-accent", value);
  }

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      <Palette className="h-4 w-4 text-text-tertiary" />
      <div className="flex gap-1.5">
        {accents.map((a) => (
          <button
            key={a.value}
            onClick={() => select(a.value)}
            className={`h-5 w-5 rounded-full transition-transform ${a.class} ${
              accent === a.value ? "scale-125 ring-2 ring-text-primary ring-offset-1 ring-offset-bg" : "opacity-60 hover:opacity-100"
            }`}
            aria-label={`Set accent to ${a.label}`}
          />
        ))}
      </div>
    </div>
  );
}
