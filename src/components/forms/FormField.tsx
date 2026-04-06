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
    <label className="group flex flex-col gap-1" htmlFor={name}>
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 transition-colors duration-300 group-focus-within:text-blue-500">
        {label}
      </span>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        disabled={disabled}
        variant="ghost"
        className="h-auto! px-0! bg-transparent! text-base font-bold text-neutral-900 placeholder:text-neutral-300 focus:ring-0"
      />
      {helperText ? <span className="text-[10px] font-medium text-neutral-400">{helperText}</span> : null}
    </label>
  );
}
