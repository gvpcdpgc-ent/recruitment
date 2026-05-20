"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhotoPreview } from "@/components/admin/PhotoPreview";
import { DeleteApplicationButton } from "@/components/admin/DeleteApplicationButton";

interface Application {
  id: string;
  application_number: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  status: string;
  applied_at: string;
  positions: any;
  photo_url?: string;
}

export function ApplicationsList({ applications: initialApplications }: { applications: Application[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredApplications = (initialApplications || []).filter((app) => {
    const posTitle = Array.isArray(app.positions) 
      ? (app.positions[0] as any)?.title 
      : (app.positions as any)?.title || "Unknown";
      
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      app.candidate_name.toLowerCase().includes(searchLower) ||
      app.candidate_email.toLowerCase().includes(searchLower) ||
      app.candidate_phone.toLowerCase().includes(searchLower) ||
      app.application_number.toLowerCase().includes(searchLower);
      
    const matchesDept = departmentFilter === "all" || posTitle === departmentFilter;
    
    return matchesSearch && matchesDept;
  });

  // Get unique positions/departments for the filter
  const departments = Array.from(new Set(
    (initialApplications || []).map(app => 
      Array.isArray(app.positions) 
        ? (app.positions[0] as any)?.title 
        : (app.positions as any)?.title || "Unknown"
    )
  )).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Global Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search name, phone, email, or application ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="w-full md:w-64 space-y-2">
          <label className="text-sm font-medium">Position / Department</label>
          <Select value={departmentFilter} onValueChange={(val) => setDepartmentFilter(val || "all")}>
            <SelectTrigger>
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
               <tr>
                  <th className="px-4 py-4 font-medium">Photo</th>
                  <th className="px-6 py-4 font-medium">App Number</th>
                  <th className="px-6 py-4 font-medium">Candidate</th>
                  <th className="px-6 py-4 font-medium">Position</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Applied At</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y relative">
               {filteredApplications.map(app => {
                  const posTitle = Array.isArray(app.positions) ? (app.positions[0] as any)?.title : (app.positions as any)?.title;
                  const applied = new Date(app.applied_at).toLocaleDateString();
                  const photoUrl = app.photo_url;
                  return (
                     <tr key={app.id} className="hover:bg-muted/30">
                       <td className="px-4 py-3">
                         {photoUrl ? (
                           <PhotoPreview src={photoUrl} name={app.candidate_name} />
                         ) : (
                           <div className="w-10 h-12 rounded border bg-muted flex items-center justify-center text-muted-foreground text-xs">N/A</div>
                         )}
                       </td>
                       <td className="px-6 py-4 font-mono font-medium text-xs">{app.application_number}</td>
                       <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{app.candidate_name}</div>
                          <div className="text-muted-foreground text-xs">{app.candidate_email}</div>
                          <div className="text-muted-foreground text-xs">{app.candidate_phone}</div>
                       </td>
                       <td className="px-6 py-4">{posTitle || 'Unknown'}</td>
                       <td className="px-6 py-4">
                         <Badge variant="secondary">
                           {app.status}
                         </Badge>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">{applied}</td>
                       <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                         <Link href={`/gvp-admin/applications/${app.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                           <Eye className="h-4 w-4 mr-2" /> View
                         </Link>
                         <DeleteApplicationButton id={app.id} name={app.candidate_name} />
                       </td>
                     </tr>
                  )
               })}
               {filteredApplications.length === 0 && (
                  <tr>
                     <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        No applications match your search filters.
                     </td>
                  </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
