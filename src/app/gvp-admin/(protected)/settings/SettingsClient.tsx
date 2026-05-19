"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Building2, Paintbrush } from "lucide-react";
import { useRouter } from "next/navigation";

export function SettingsClient({ initialDepartments, initialBranding }: { initialDepartments: any[], initialBranding: any }) {
  const router = useRouter();
  
  // Branding State
  const [brandingId] = useState(initialBranding?.id || null);
  const [instituteName, setInstituteName] = useState(initialBranding?.institute_name || "");
  const [footerText, setFooterText] = useState(initialBranding?.footer_text || "");
  const [contactEmail, setContactEmail] = useState(initialBranding?.contact_email || "");
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Departments State
  const [departments, setDepartments] = useState<any[]>(initialDepartments);
  const [newDeptName, setNewDeptName] = useState("");
  const [isSavingDept, setIsSavingDept] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);

  const handleSaveBranding = async () => {
    setIsSavingBranding(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: brandingId, institute_name: instituteName, footer_text: footerText, contact_email: contactEmail })
      });
      if (res.ok) {
        toast.success("Branding settings saved successfully");
        router.refresh();
      } else {
        toast.error("Failed to save settings");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDeptName) return;
    setIsSavingDept(true);
    try {
      const res = await fetch("/api/admin/departments", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ name: newDeptName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
         toast.success("Department added");
         setDepartments([...departments, data.department]);
         setNewDeptName("");
         router.refresh();
      } else {
         toast.error("Failed to add department");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setIsSavingDept(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
     try {
       const res = await fetch(`/api/admin/departments/${id}`, { method: "DELETE" });
       if (res.ok) {
         toast.success("Department removed");
         setDepartments(departments.filter(d => d.id !== id));
         router.refresh();
       } else {
         toast.error("Failed to delete. It might be in use.");
       }
     } catch (e) {
       toast.error("Network error");
     }
  };

  return (
    <Tabs defaultValue="branding" className="mt-6">
      <TabsList className="grid w-full grid-cols-2 max-w-sm">
        <TabsTrigger value="branding"><Paintbrush className="w-4 h-4 mr-2" /> Branding</TabsTrigger>
        <TabsTrigger value="departments"><Building2 className="w-4 h-4 mr-2" /> Departments</TabsTrigger>
      </TabsList>

      <TabsContent value="branding" className="mt-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label>Institute Name</Label>
            <Input value={instituteName} onChange={e => setInstituteName(e.target.value)} placeholder="e.g. Global University" />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="recruitment@university.edu" />
          </div>
          <div className="space-y-2">
            <Label>Footer Copyright Text</Label>
            <Input value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="© 2026 All rights reserved" />
          </div>
          
          <Button onClick={handleSaveBranding} disabled={isSavingBranding} className="mt-4">
            {isSavingBranding ? "Saving..." : "Save Branding"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="departments" className="mt-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm max-w-2xl">
          <div className="flex gap-4 mb-6">
             <Input 
                value={newDeptName} 
                onChange={e => setNewDeptName(e.target.value)} 
                placeholder="e.g. Computer Science" 
             />
             <Button onClick={handleAddDepartment} disabled={isSavingDept || !newDeptName} className="shrink-0">
               <Plus className="w-4 h-4 mr-2" /> Add Department
             </Button>
          </div>

          <div className="border rounded-md divide-y">
            {departments.length === 0 ? (
               <div className="p-4 text-center text-muted-foreground">No departments configured.</div>
            ) : (
               departments.map(dept => (
                 <div key={dept.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                   <span className="font-medium">{dept.name}</span>
                   <Button variant="ghost" size="icon" onClick={() => setDepartmentToDelete(dept.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                   </Button>
                 </div>
               ))
            )}
          </div>
        </div>
      </TabsContent>

      {/* Delete Confirmation Modal Overlay */}
      {departmentToDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border shadow-lg rounded-xl p-6 max-w-md w-full animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold">Are you sure?</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              Positions linked to this department might lose their label if strict relations exist. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 filter-none">
              <Button variant="outline" onClick={() => setDepartmentToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                handleDeleteDepartment(departmentToDelete);
                setDepartmentToDelete(null);
              }}>
                Delete Department
              </Button>
            </div>
          </div>
        </div>
      )}
    </Tabs>
  );
}
