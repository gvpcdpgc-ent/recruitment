"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Hand } from "lucide-react";

interface FormField {
   id: string;
   label: string;
   type: string;
   required: boolean;
   options?: string[]; 
}

const FIELD_TYPES = ['Text', 'Email', 'Number', 'Textarea', 'Dropdown', 'File Upload'];

export function PositionFormBuilder({ departments }: { departments: any[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Basic Position State
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [description, setDescription] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [instructions, setInstructions] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("hidden");

  // Dynamic Form Builder State
  const [fields, setFields] = useState<FormField[]>([]);

  const addField = () => {
    setFields([...fields, { 
      id: `field_${Date.now()}`, 
      label: "New Field", 
      type: "Text", 
      required: false,
      options: []
    }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, key: keyof FormField, value: any) => {
    setFields(fields.map(f => {
      if (f.id === id) {
        return { ...f, [key]: value };
      }
      return f;
    }));
  };

  const handleOptionsChange = (id: string, valStr: string) => {
     const options = valStr.split(',').map(s => s.trim()).filter(Boolean);
     updateField(id, 'options', options);
  };

  const handleSave = async () => {
    if (!title) {
       toast.error("Title is required");
       return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/positions", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            title,
            department_id: departmentId || null,
            description,
            qualifications,
            instructions,
            deadline: deadline ? new Date(deadline + "+05:30").toISOString() : null,
            status,
            dynamicFields: fields
         })
      });

      const data = await res.json();
      if (res.ok && data.success) {
         toast.success("Position created successfully!");
         router.push("/gvp-admin/positions");
         router.refresh();
      } else {
         toast.error(data.error || "Failed to create position");
      }

    } catch (e) {
       toast.error("Network error");
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Settings */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
         <h3 className="text-xl font-bold border-b pb-4">Basic Information</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <Label>Position Title <span className="text-destructive">*</span></Label>
               <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Assistant Professor" />
            </div>
            <div className="space-y-2">
               <Label>Department</Label>
               <Select value={departmentId} onValueChange={val => setDepartmentId(val || '')}>
                  <SelectTrigger>
                     <SelectValue placeholder="Select Department..." />
                  </SelectTrigger>
                  <SelectContent>
                     {departments.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>
            
            <div className="space-y-2">
               <Label>Application Deadline (IST Date & Time)</Label>
               <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            
            <div className="space-y-2">
               <Label>Initial Status</Label>
               <Select value={status} onValueChange={val => setStatus(val || 'hidden')}>
                  <SelectTrigger>
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="open">Open (Publicly Visible)</SelectItem>
                     <SelectItem value="closed">Closed (Visible but Closed)</SelectItem>
                     <SelectItem value="hidden">Hidden (Completely Invisible)</SelectItem>
                  </SelectContent>
               </Select>
            </div>
         </div>

         <div className="space-y-2">
            <Label>Description</Label>
            <Textarea className="h-32" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="HTML allowed" />
         </div>

         <div className="space-y-2">
            <Label>Qualifications</Label>
            <Textarea className="h-32" value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="HTML allowed" />
         </div>
         
         <div className="space-y-2">
            <Label>Specific Instructions</Label>
            <Textarea className="h-24" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="HTML allowed" />
         </div>
      </div>

      {/* Dynamic Form Builder */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
         <div className="flex items-center justify-between border-b pb-4">
            <div>
               <h3 className="text-xl font-bold">Dynamic Application Form</h3>
               <p className="text-sm text-muted-foreground mt-1">Configure fields candidates must fill out.</p>
            </div>
            <Button onClick={addField} size="sm"><Plus className="h-4 w-4 mr-2" /> Add Field</Button>
         </div>

         <div className="space-y-4">
            {fields.map((field, index) => (
               <div key={field.id} className="p-4 border rounded-lg bg-muted/20 flex gap-4 items-start">
                  <div className="mt-2 text-muted-foreground cursor-grab">
                     <Hand className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                     <div className="col-span-4 space-y-2">
                        <Label>Field Label</Label>
                        <Input value={field.label} onChange={(e) => updateField(field.id, 'label', e.target.value)} />
                     </div>
                     <div className="col-span-4 space-y-2">
                        <Label>Type</Label>
                        <Select value={field.type} onValueChange={(val) => updateField(field.id, 'type', val)}>
                           <SelectTrigger><SelectValue /></SelectTrigger>
                           <SelectContent>
                              {FIELD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="col-span-2 space-y-2 flex flex-col justify-center mt-6">
                         <div className="flex items-center space-x-2">
                           <Checkbox id={`req-${field.id}`} checked={field.required} onCheckedChange={(c) => updateField(field.id, 'required', !!c)} />
                           <label htmlFor={`req-${field.id}`} className="text-sm font-medium">Required</label>
                         </div>
                     </div>
                     <div className="col-span-2 space-y-2 flex items-end justify-end">
                        <Button variant="destructive" size="icon" onClick={() => removeField(field.id)}><Trash2 className="h-4 w-4" /></Button>
                     </div>

                     {/* Options for Dropdown */}
                     {field.type === 'Dropdown' && (
                        <div className="col-span-12 space-y-2 border-t pt-4 mt-2 border-dashed">
                           <Label>Dropdown Options (Comma separated)</Label>
                           <Input 
                              value={field.options?.join(', ') || ''} 
                              onChange={(e) => handleOptionsChange(field.id, e.target.value)} 
                              placeholder="e.g. Option 1, Option 2, Option 3" 
                           />
                        </div>
                     )}
                  </div>
               </div>
            ))}
            
            {fields.length === 0 && (
               <div className="text-center p-8 border-dashed border-2 rounded-xl text-muted-foreground">
                  No dynamic fields added. Basic Details (Name, Email, Phone) are always collected by default.
               </div>
            )}
         </div>
      </div>

      <div className="flex justify-end gap-4">
         <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
         <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Position"}
         </Button>
      </div>
    </div>
  );
}
