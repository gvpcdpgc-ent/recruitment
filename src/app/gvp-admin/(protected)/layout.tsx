"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, Users, Settings, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const NavLinks = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-2 flex-1">
      <Link 
         href="/gvp-admin" 
         className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary", pathname === "/gvp-admin" ? "bg-muted text-primary" : "text-muted-foreground")}
      >
        <LayoutDashboard className="h-4 w-4" /> Dashboard
      </Link>
      <Link 
         href="/gvp-admin/positions" 
         className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary", pathname.includes("/positions") ? "bg-muted text-primary" : "text-muted-foreground")}
      >
        <Briefcase className="h-4 w-4" /> Positions
      </Link>
      <Link 
         href="/gvp-admin/applications" 
         className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary", pathname.includes("/applications") ? "bg-muted text-primary" : "text-muted-foreground")}
      >
        <Users className="h-4 w-4" /> Applications
      </Link>
      <Link 
         href="/gvp-admin/settings" 
         className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary", pathname.includes("/settings") ? "bg-muted text-primary" : "text-muted-foreground")}
      >
        <Settings className="h-4 w-4" /> Settings
      </Link>
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
       
       <div className="hidden border-r bg-muted/10 md:flex flex-col gap-2">
         <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
           <Link href="/" className="flex items-center gap-2 font-semibold">
             <span className="">Recruitment Admin</span>
           </Link>
         </div>
         <div className="flex-1 flow-root mt-4">
           <NavLinks />
         </div>
         <div className="mt-auto p-4 flex">
           <a href="/api/admin/logout" className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground font-medium transition-all hover:text-destructive hover:bg-destructive/10">
             <LogOut className="h-4 w-4" /> Logout
           </a>
         </div>
       </div>
       
       <div className="flex flex-col">
         <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/10 px-4 md:hidden">
           <Sheet>
             <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "icon" }), "shrink-0 md:hidden")}>
                 <Menu className="h-5 w-5" />
                 <span className="sr-only">Toggle navigation menu</span>
             </SheetTrigger>
             <SheetContent side="left" className="flex flex-col">
               <div className="mt-4 flex-1">
                 <NavLinks />
               </div>
                <div className="mt-auto flex">
                 <a href="/api/admin/logout" className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground font-medium transition-all hover:text-destructive hover:bg-destructive/10">
                   <LogOut className="h-4 w-4" /> Logout
                 </a>
               </div>
             </SheetContent>
           </Sheet>
         </header>
         
         <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 bg-background">
            {children}
         </main>
       </div>
    </div>
  );
}
