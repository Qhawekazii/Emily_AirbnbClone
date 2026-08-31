/**
 * components/SkeletonCard/SkeletonCard.jsx
 * Animated loading placeholder that matches the LocationPage card layout.
 * Improves perceived performance while listings are fetching.
 */
import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-img skeleton-pulse" />
    <div className="skeleton-body">
      <div className="skeleton-line skeleton-pulse short" />
      <div className="skeleton-line skeleton-pulse" />
      <div className="skeleton-line skeleton-pulse medium" />
      <div className="skeleton-meta">
        <div className="skeleton-line skeleton-pulse short" />
        <div className="skeleton-line skeleton-pulse short" />
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 4 }) => (
  <div className="skeleton-list" aria-label="Loading listings..." aria-busy="true">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export default SkeletonCard;
