export default function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return <div className="grid grid-3">
    {Array.from({ length: cards }).map((_, i) => <div key={i} className="card skeleton-card">
      <div className="skeleton-line wide" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>)}
  </div>;
}
