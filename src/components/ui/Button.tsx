type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, ...props }: Props) {
  return (
    <button
      className={`px-6 py-2.5 rounded-2xl text-sm font-black tracking-tight bg-neutral-900 text-white transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}
