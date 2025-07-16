export default function Badge({ label }: { label: string }) {
  return (
    <span className="inline-block bg-teal text-navy font-sans px-3 py-1 rounded-full shadow-card animate-bounce hover:scale-110 transition-transform duration-300">
      {label}
    </span>
  );
}
