export default function Badge({ text }: { text: string }) {
  return (
    <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">
      {text}
    </span>
  );
}
