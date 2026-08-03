'use client';
export function SkeletonCard({ count = 3, height = 80 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height, borderRadius: 14 }} />
      ))}
    </div>
  );
}
export function SkeletonGrid({ count = 6, minWidth = 280, height = 140 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`, gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height, borderRadius: 14 }} />
      ))}
    </div>
  );
}
export function SkeletonText({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 14, borderRadius: 6, width: i === lines-1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}
