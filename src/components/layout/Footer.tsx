import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-8 px-4 md:px-6 gap-4">
        <div className="text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Global University. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/positions" className="text-sm text-muted-foreground hover:text-primary">
            Positions
          </Link>
          <Link href="/gvp-admin" className="text-sm text-muted-foreground hover:text-primary">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
