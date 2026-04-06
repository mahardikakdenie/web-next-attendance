"use client";

type SwitchProps = {
  checked: boolean;
  label: string;
  description?: string;
  disabled?: boolean;
};

export default function Switch({ checked, label, description, disabled = false }: SwitchProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {description ? (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        ) : null}
      </div>

      <button
        type="button"
        disabled={disabled}
        aria-pressed={checked}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-default"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
