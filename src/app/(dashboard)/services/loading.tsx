export default function Loading() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      <div className="h-8 bg-muted rounded w-32" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 bg-muted rounded-lg" />
      ))}
    </div>
  );
}
