import Input from "@/components/ui/Input";

type FormFieldProps = {
  label: string;
  name: string;
  value: string | number;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
};

export default function FormField({
  label,
  name,
  value,
  type = "text",
  placeholder,
  helperText,
  disabled = false,
}: FormFieldProps) {
  return (
    <label className="flex flex-col gap-2" htmlFor={name}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly
      />
      {helperText ? <span className="text-xs text-slate-500">{helperText}</span> : null}
    </label>
  );
}
