export default function Loading() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      <div className="h-8 bg-muted rounded w-48" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-24 bg-muted rounded-lg" />
      ))}
    </div>
  );
}
