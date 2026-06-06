"use client"

interface NotFoundPageProps {
  onGoHome: () => void
}

export function NotFoundPage({ onGoHome }: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-orange-500/[0.05] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
      </div>
      <div className="relative z-10 text-center max-w-md w-full">
        <div className="text-[120px] md:text-[160px] font-bold text-gradient-brand leading-none mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
          404
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Page Not Found</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white shadow-lg shadow-orange-500/20 hover:opacity-90 transition-opacity"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Go to Homepage
        </button>
      </div>
    </div>
  )
}
