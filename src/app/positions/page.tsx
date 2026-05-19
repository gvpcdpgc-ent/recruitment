import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabaseServer } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function PositionsPage() {
  const { data: positions } = await supabaseServer
    .from("positions")
    .select(`
      id, 
      title, 
      department_id, 
      deadline, 
      status, 
      departments(name)
    `)
    .in("status", ["open", "closed"])
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex-1">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Open Positions</h1>
          <p className="text-muted-foreground mt-2">
            Browse our current faculty opportunities across various departments.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {positions && positions.length > 0 ? (
            positions.map((pos) => {
              const dl = pos.deadline ? new Date(pos.deadline).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) + ' IST' : "Until Filled";
              const deptName = Array.isArray(pos.departments) ? (pos.departments[0] as any)?.name : (pos.departments as any)?.name;
              const isClosed = pos.status === 'closed';

              return (
                <div key={pos.id} className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {deptName || "General"}
                      </div>
                      {isClosed && (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                          Closed
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold leading-tight">
                      {pos.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Deadline: {dl}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <Link 
                      href={`/apply/${pos.id}`}
                      className={cn(buttonVariants({ variant: isClosed ? "outline" : "default" }))}
                    >
                      {isClosed ? "View Details" : "Apply Now"}
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 border border-dashed rounded-xl text-center">
              <p className="text-muted-foreground">No positions currently available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
