export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      {children}
    </div>
  );
}
