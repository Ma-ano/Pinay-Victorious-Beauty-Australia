export function ProductCardSkeleton() {
  return (
    <div className="bg-card overflow-hidden border border-gray-200 dark:border-gray-600 rounded-xl">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-3/4 skeleton" />
        <div className="h-3 w-1/2 skeleton" />
        <div className="h-4 w-1/3 skeleton" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-primary/10">
        <div className="space-y-2">
          <div className="h-4 w-32 skeleton" />
          <div className="h-3 w-48 skeleton" />
        </div>
        <div className="h-6 w-20 skeleton rounded-full" />
      </div>
      <div className="px-5 py-3">
        <div className="flex gap-2">
          <div className="h-2 w-12 skeleton rounded-full" />
          <div className="h-2 w-12 skeleton rounded-full" />
          <div className="h-2 w-12 skeleton rounded-full" />
        </div>
      </div>
      <div className="divide-y divide-primary/10">
        {[1, 2].map((i) => (
          <div key={i} className="px-5 py-4 flex gap-3">
            <div className="w-12 h-12 rounded-xl skeleton shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 skeleton" />
              <div className="h-3 w-1/2 skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto rounded-full skeleton" />
        <div className="mt-4 h-6 w-40 mx-auto skeleton" />
      </div>
      <div className="bg-card border border-primary/10 rounded-2xl p-6 md:p-8 space-y-5">
        <div className="h-5 w-32 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-12 skeleton" />
            <div className="h-4 w-40 skeleton" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-12 skeleton" />
            <div className="h-4 w-48 skeleton" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-12 skeleton" />
            <div className="h-4 w-32 skeleton" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-12 skeleton" />
            <div className="h-4 w-36 skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutFormSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-8 w-32 skeleton mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <div className="bg-card border border-primary/10 rounded-2xl p-6 space-y-4">
            <div className="h-5 w-40 skeleton" />
            <div className="h-10 w-full skeleton rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 skeleton rounded-xl" />
              <div className="h-10 skeleton rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 skeleton rounded-xl" />
              <div className="h-10 skeleton rounded-xl" />
            </div>
          </div>
          <div className="bg-card border border-primary/10 rounded-2xl p-6 space-y-4">
            <div className="h-5 w-36 skeleton" />
            <div className="h-16 w-full skeleton rounded-xl" />
            <div className="h-16 w-full skeleton rounded-xl" />
            <div className="h-16 w-full skeleton rounded-xl" />
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-card border border-gray-200 rounded-2xl p-6 space-y-4">
            <div className="h-5 w-36 skeleton" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 w-24 skeleton" />
                  <div className="h-3 w-16 skeleton" />
                </div>
              ))}
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between">
              <div className="h-4 w-16 skeleton" />
              <div className="h-4 w-20 skeleton" />
            </div>
            <div className="h-10 w-full skeleton rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrendingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="h-7 w-40 skeleton" />
      <div className="h-4 w-60 skeleton" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}

export function BestSellingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="h-7 w-40 skeleton" />
      <div className="h-4 w-60 skeleton" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}

export function ReviewsSectionSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="text-center mb-10 space-y-3">
        <div className="h-4 w-24 skeleton mx-auto" />
        <div className="h-8 w-56 skeleton mx-auto" />
        <div className="mx-auto w-24 h-0.5 skeleton" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border-2 border-dashed border-accent/25 p-6 space-y-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="w-4 h-4 skeleton rounded-sm" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full skeleton" />
              <div className="h-3 w-11/12 skeleton" />
              <div className="h-3 w-4/5 skeleton" />
            </div>
            <div className="pt-4 border-t border-dashed border-accent/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 skeleton rounded-full" />
                <div className="h-4 w-20 skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShopPageSkeleton() {
  return <ProductGridSkeleton count={8} />;
}

export function SalePageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="min-h-[30vh] rounded-3xl skeleton mb-12" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
