"use client";

import { cn } from "@/lib/utils/cn";
import { CATEGORY_LABELS } from "@/lib/utils/format";

const CATEGORIES = ["ALL", "FIRST_AID", "RAIN", "HYGIENE", "ELECTRONICS"] as const;

export function CategoryTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
            active === cat
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:text-foreground border border-border"
          )}
        >
          {cat === "ALL" ? "ทั้งหมด" : CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  );
}
