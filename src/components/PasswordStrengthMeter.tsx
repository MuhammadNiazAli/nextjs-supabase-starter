"use client";

import { getPasswordStrength } from "@/lib/passwordStrength";

const BAR_COLORS: Record<string, string> = {
  Weak: "bg-red-500",
  Medium: "bg-amber-500",
  Strong: "bg-green-500",
};

const LABEL_COLORS: Record<string, string> = {
  Weak: "text-red-500",
  Medium: "text-amber-500",
  Strong: "text-green-600 dark:text-green-500",
};

export default function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const { score, label } = getPasswordStrength(password);
  // 3 segments, filled proportionally to the 0-4 score range.
  const filledSegments = label === "Weak" ? 1 : label === "Medium" ? 2 : 3;

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < filledSegments ? BAR_COLORS[label] : "bg-gray-200 dark:bg-gray-800"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs mt-1.5 font-medium ${LABEL_COLORS[label]}`}>
        Password strength: {label}
      </p>
    </div>
  );
}
