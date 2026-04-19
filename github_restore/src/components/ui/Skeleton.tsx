'use client';

import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseClass = "bg-gray-200 dark:bg-gray-700 animate-pulse";
  const variantClass = variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'rounded h-4 w-full' : 'rounded-lg';
  
  return (
    <div className={`${baseClass} ${variantClass} ${className}`} />
  );
}

export function RestaurantSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4 p-3 flex gap-3">
      <Skeleton className="w-24 h-24 flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton variant="text" className="w-3/4 h-5" />
        <Skeleton variant="text" className="w-1/2 h-3" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      </div>
    </div>
  );
}
