"use client";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  // Accessible name for the switch, read by screen readers.
  label: string;
};

// A reusable on/off switch: a track with a knob that slides across it.
// It is a plain <button> with role="switch", so it is focusable, toggles
// with Space or Enter, and screen readers announce its state through
// aria-checked. The knob slides with a spring-like easing (a slight
// overshoot at the end of the travel). When reduced motion is on, the
// app's .reduce-motion class kills the transition and the knob jumps
// instantly instead; motion-reduce covers the OS setting for visitors
// who never touch the toggle.
export default function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
        checked ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
