import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="border-0 shadow-sm">
      <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
      <CardContent><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div></CardContent>
    </Card>
  </div>
);

export const TableSkeleton = ({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
    <div className="flex gap-3">
      <Skeleton className="h-10 flex-1 max-w-md rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="flex border-b px-4 py-3 gap-4">
              {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex border-b px-4 py-3 gap-4">
                {Array.from({ length: cols }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1" style={{ opacity: 1 - i * 0.08 }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const MapSkeleton = () => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <div className="flex gap-3">
      <Skeleton className="h-10 w-40 rounded-md" />
      <Skeleton className="h-10 w-40 rounded-md" />
    </div>
    <Skeleton className="h-[500px] w-full rounded-lg" />
  </div>
);
