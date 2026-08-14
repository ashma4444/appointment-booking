export default function Loading() {
  return (
    <div className="p-4 space-y-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-36" />
        <div className="h-48 bg-muted rounded-lg" />
      </div>
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-28" />
        <div className="h-32 bg-muted rounded-lg" />
        <div className="h-24 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
