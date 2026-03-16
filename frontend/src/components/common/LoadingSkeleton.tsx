
interface LoadingSkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  lines?: number;
}

export const LoadingSkeleton = ({ 
  className = '', 
  height = 'h-4', 
  width = 'w-full',
  lines = 1 
}: LoadingSkeletonProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${height} ${width} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '1.5s'
          }}
        />
      ))}
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
    <LoadingSkeleton height="h-6" width="w-3/4" className="mb-4" />
    <LoadingSkeleton height="h-4" width="w-full" className="mb-2" />
    <LoadingSkeleton height="h-4" width="w-5/6" className="mb-4" />
    <div className="flex justify-between items-center">
      <LoadingSkeleton height="h-8" width="w-20" />
      <LoadingSkeleton height="h-8" width="w-24" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
      <LoadingSkeleton height="h-4" width="w-1/4" />
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="p-4">
          <div className="flex items-center space-x-4">
            <LoadingSkeleton height="h-10" width="w-10" className="rounded-full" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton height="h-4" width="w-3/4" />
              <LoadingSkeleton height="h-3" width="w-1/2" />
            </div>
            <LoadingSkeleton height="h-8" width="w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <LoadingSkeleton height="h-8" width="w-8" className="rounded" />
          <LoadingSkeleton height="h-4" width="w-16" />
        </div>
        <LoadingSkeleton height="h-8" width="w-3/4" className="mb-2" />
        <LoadingSkeleton height="h-3" width="w-1/2" />
      </div>
    ))}
  </div>
);
