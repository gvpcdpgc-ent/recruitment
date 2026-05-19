export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* The rotating spinner */}
        <div className="absolute inset-0 border-4 border-muted/30 border-t-primary rounded-full animate-spin"></div>
        {/* The fixed logo in the center */}
        <img 
          src="https://www.gvpcdpgc.edu.in/gvpcdpgc-logo.png" 
          alt="Loading Logo" 
          className="absolute w-12 h-12 object-contain" 
        />
      </div>
      <p className="text-muted-foreground animate-pulse font-medium tracking-widest uppercase text-sm">
        Loading System
      </p>
    </div>
  );
}
