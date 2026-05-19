import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header({ instituteName = "Global University" }: { instituteName?: string }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="https://www.gvpcdpgc.edu.in/gvpcdpgc-logo.png" alt="Logo" className="h-10 w-auto object-contain" />
          <span className="text-xs sm:text-sm md:text-lg font-extrabold tracking-tight text-primary leading-tight max-w-[200px] sm:max-w-md lg:max-w-2xl uppercase">
            {instituteName}
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/positions" className="text-sm font-medium transition-colors hover:text-primary">
            Open Positions
          </Link>
          <Link href="/gvp-admin" className={cn(buttonVariants({ size: "sm" }), "hidden md:inline-flex")}>
            Admin Portal
          </Link>
        </nav>
      </div>
    </header>
  );
}
