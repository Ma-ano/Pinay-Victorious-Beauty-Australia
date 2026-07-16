export default function MaintenancePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
          <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full bg-accent/5 flex items-center justify-center">
            <span className="text-2xl">🔧</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-dark mb-3">
          We&apos;ll be back soon
        </h1>
        <p className="text-sm text-foreground/80 leading-relaxed">
          We&apos;re currently fixing some issues.
          <br />
          Thank you for your patience.
        </p>

        <div className="mt-8 flex justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent/40 animate-pulse-slow" />
          <span className="w-2 h-2 rounded-full bg-accent/60 animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" style={{ animationDelay: "1s" }} />
        </div>
      </div>
    </div>
  );
}
