export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-scale-in">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary via-secondary to-accent animate-pulse-slow" />
        <div className="mt-6 h-4 w-32 mx-auto skeleton" />
        <div className="mt-3 h-3 w-24 mx-auto skeleton" />
      </div>
    </div>
  );
}
