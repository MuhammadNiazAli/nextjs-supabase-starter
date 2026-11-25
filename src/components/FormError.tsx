"use client";

// Shared inline error for auth forms (login + signup). The wrapper stays
// in the DOM so the message can grow/shrink smoothly instead of popping in
// and jumping the form — the height animation lives in `.form-error` in
// globals.css (grid rows 0fr -> 1fr), and reduced motion is handled there
// too, so this component needs no motion logic of its own. The <p> is
// always rendered (empty when there is no message) so the alert region
// exists before the error appears and screen readers announce it.
export default function FormError({ message }: { message?: string | null }) {
  const hasMessage = Boolean(message);

  return (
    <div className={"form-error" + (hasMessage ? " form-error--open" : "")}>
      <p role="alert" className="text-red-500 text-xs mt-1.5">
        {message ?? ""}
      </p>
    </div>
  );
}
