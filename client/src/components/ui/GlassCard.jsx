'use client';

import { forwardRef } from 'react';

const GlassCard = forwardRef(function GlassCard({ children, className = '', hover = true, style = {}, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`glass ${hover ? 'glass-hover' : ''} ${className}`}
      style={{ transition: 'all 0.3s ease', ...style }}
      {...props}
    >
      {children}
    </div>
  );
});

export default GlassCard;
