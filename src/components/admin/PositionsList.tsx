"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeletePositionButton } from "@/components/admin/DeletePositionButton";

interface Position {
  id: string;
  title: string;
  status: string;
  deadline: string;
  departments: any;
}

export function PositionsList({ positions: initialPositions }: { positions: Position[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredPositions = (initialPositions || []).filter((pos) => {
    const deptName = Array.isArray(pos.departments) 
      ? (pos.departments[0] as any)?.name 
      : (pos.departments as any)?.name || "General";
      
    const matchesSearch = pos.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === "all" || deptName === departmentFilter;
    
    return matchesSearch && matchesDept;
  });

  // Get unique departments for the filter
  const departments = Array.from(new Set(
    (initialPositions || []).map(pos => 
      Array.isArray(pos.departments) 
        ? (pos.departments[0] as any)?.name 
        : (pos.departments as any)?.name || "General"
    )
  )).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Search Position</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="w-full md:w-64 space-y-2">
          <label className="text-sm font-medium">Department</label>
          <Select value={departmentFilter} onValueChange={(val) => setDepartmentFilter(val || "all")}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
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
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Deadline</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y relative">
               {filteredPositions.map(pos => {
                  const dept = Array.isArray(pos.departments) ? (pos.departments[0] as any)?.name : (pos.departments as any)?.name;
                  const dl = pos.deadline ? new Date(pos.deadline).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) + ' IST' : 'N/A';
                  return (
                     <tr key={pos.id} className="hover:bg-muted/30">
                       <td className="px-6 py-4 font-semibold text-foreground">{pos.title}</td>
                       <td className="px-6 py-4">{dept || 'General'}</td>
                       <td className="px-6 py-4">
                         <Badge variant={pos.status === 'open' ? 'default' : pos.status === 'hidden' ? 'outline' : 'secondary'}>
                           {pos.status}
                         </Badge>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">{dl}</td>
                       <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                         <Link href={`/gvp-admin/positions/${pos.id}/edit`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                           <Edit className="h-4 w-4 mr-2" /> Edit
                         </Link>
                         <DeletePositionButton id={pos.id} title={pos.title} />
                       </td>
                     </tr>
                  )
               })}
               {filteredPositions.length === 0 && (
                  <tr>
                     <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No positions match your filters.
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
