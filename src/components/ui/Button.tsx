type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className, ...props }: Props) {
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 ${className}`}
      {...props}
    />
  );
}
