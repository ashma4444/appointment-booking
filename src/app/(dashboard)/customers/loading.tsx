export default function Loading() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      <div className="h-10 bg-muted rounded-lg" />
      <div className="h-6 bg-muted rounded w-32" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-muted rounded-lg" />
      ))}
    </div>
  );
}
