import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabaseServer } from "@/lib/supabase/server";

export const revalidate = 0; // Disable static rendering for fresh data initially

export default async function Home() {
  const { data: positions } = await supabaseServer
    .from("positions")
    .select(`
      id, 
      title, 
      department_id, 
      deadline, 
      departments(name)
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="flex-col flex items-center w-full">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <div className="max-w-[800px] space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Join Our World-Class Faculty
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Global University is actively seeking passionate educators and researchers 
              to shape the future. Discover open positions and apply today.
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/positions" 
              className={cn(buttonVariants({ size: "lg", variant: "default" }), "h-12 px-8 text-base")}
            >
              View All Open Positions
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Positions */}
      <section className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Featured Openings</h2>
            <Link href="/positions" className={cn(buttonVariants({ variant: "ghost" }))}>
              See All &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {positions && positions.length > 0 ? (
              positions.map((pos) => {
                // Formatting date cleanly
                const dl = pos.deadline ? new Date(pos.deadline).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) + ' IST' : "Until Filled";
                const deptName = Array.isArray(pos.departments) ? (pos.departments[0] as any)?.name : (pos.departments as any)?.name;

                return (
                  <div key={pos.id} className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col">
                    <div className="flex flex-col flex-1 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {deptName || "General"}
                      </div>
                      <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {pos.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 flex-1">
                        Application Deadline: {dl}
                      </p>
                    </div>
                    <div className="pt-6 mt-6 border-t flex justify-end">
                      <Link 
                        href={`/apply/${pos.id}`}
                        className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full flex justify-center py-12 border border-dashed rounded-xl">
                <p className="text-muted-foreground">No open positions currently available.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
