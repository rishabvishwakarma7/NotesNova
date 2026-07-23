'use client';

export default function LoadingSkeleton({ width = '100%', height = '20px', rounded = '8px', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: rounded }}
    />
  );
}
