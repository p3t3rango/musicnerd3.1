import { motion } from 'framer-motion';

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column Skeleton */}
      <div className="space-y-6">
        <div className="bg-white/5 rounded-lg p-6">
          {/* Artist Header Skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
            <div className="space-y-3">
              <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Bio Skeleton */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="h-4 bg-white/10 rounded animate-pulse"
                style={{ width: `${Math.random() * 30 + 70}%` }} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column Skeleton */}
      <div className="space-y-6">
        {[...Array(3)].map((_, sectionIndex) => (
          <div key={sectionIndex} className="bg-white/5 rounded-lg p-6">
            <div className="h-6 w-32 bg-white/10 rounded mb-4 animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="h-12 bg-white/10 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 