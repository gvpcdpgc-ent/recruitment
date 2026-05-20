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
import { Plus, Trash2 } from "lucide-react";

interface FormField {
   id: string;
   label: string;
   type: string;
   required: boolean;
   options?: string[]; 
   rawOptionsDisplay?: string;
}

const FIELD_TYPES = ['Text', 'Email', 'Number', 'Textarea', 'Dropdown', 'File Upload'];

export function PositionFormBuilder({ departments, initialData = null }: { departments: any[], initialData?: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Basic Position State
  const [title, setTitle] = useState(initialData?.title || "");
  const [departmentId, setDepartmentId] = useState(initialData?.department_id || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [qualifications, setQualifications] = useState(initialData?.qualifications || "");
  const [instructions, setInstructions] = useState(initialData?.instructions || "");
  
  const getInitialDeadline = () => {
    if (!initialData?.deadline) return "";
    return new Date(initialData.deadline).toISOString().slice(0, 16);
  };
  const [deadline, setDeadline] = useState(getInitialDeadline());
  const [status, setStatus] = useState(initialData?.status || "hidden");
  const [appPrefix, setAppPrefix] = useState(initialData?.app_prefix || "");
  const [initialCounter, setInitialCounter] = useState(initialData?.next_counter || 1);

  // Dynamic Form Builder State
  const [fields, setFields] = useState<FormField[]>(initialData?.dynamic_form_schema || []);

  const addField = () => {
    setFields([...fields, { 
      id: `field_${Date.now()}`, 
      label: "", 
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
     // Keep the raw string for the UI so commas/spaces aren't eaten while typing
     updateField(id, 'rawOptionsDisplay', valStr);
     
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
      const url = initialData?.id ? `/api/admin/positions/${initialData.id}` : "/api/admin/positions";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
         method,
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            title,
            department_id: departmentId || null,
            description,
            qualifications,
            instructions,
            deadline: deadline ? new Date(deadline + "+05:30").toISOString() : null,
            status,
            app_prefix: appPrefix,
            next_counter: parseInt(String(initialCounter)) || 1,
            dynamicFields: fields
         })
      });

      const data = await res.json();
      if (res.ok && data.success) {
         toast.success(`Position ${initialData?.id ? 'updated' : 'created'} successfully!`);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Basic Settings & HTML content */}
      <div className="col-span-1 lg:col-span-8 space-y-8">
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
                     <SelectValue placeholder="Select Department...">
                        {departments.find(d => d.id === departmentId)?.name || 'Select Department...'}
                     </SelectValue>
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
                     <SelectValue>
                        {status === 'open' ? 'Open (Publicly Visible)' : status === 'closed' ? 'Closed (Visible but Closed)' : 'Hidden (Completely Invisible)'}
                     </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="open">Open (Publicly Visible)</SelectItem>
                     <SelectItem value="closed">Closed (Visible but Closed)</SelectItem>
                     <SelectItem value="hidden">Hidden (Completely Invisible)</SelectItem>
                  </SelectContent>
               </Select>
            </div>
         </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
             <div className="space-y-2">
                <Label>App Number Prefix <span className="text-destructive">*</span></Label>
                <Input value={appPrefix} onChange={(e) => setAppPrefix(e.target.value.toUpperCase())} placeholder="e.g. CSE-FAC" />
                <p className="text-[10px] text-muted-foreground uppercase">e.g. {appPrefix || 'PREFIX'}-202605-001</p>
             </div>
             <div className="space-y-2">
                <Label>Start Counter From</Label>
                <Input type="number" value={initialCounter} onChange={(e) => setInitialCounter(parseInt(e.target.value) || 1)} min="1" />
                <p className="text-[10px] text-muted-foreground">Next application will use this number</p>
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

       {/* Submit Button Block for Mobile */}
       <div className="flex justify-end gap-4 lg:hidden">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
             {isLoading ? "Saving..." : "Save Position"}
          </Button>
       </div>
      </div>

       {/* Right Column: Submit Actions Desktop & Dropdown for Dynamic Fields */}
       <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm hidden lg:block space-y-4">
             <h3 className="text-lg font-bold border-b pb-2 mb-4">Actions</h3>
             <Button className="w-full" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Position"}
             </Button>
             <Button variant="outline" className="w-full" onClick={() => router.back()}>Cancel</Button>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm flex-1">
             <div className="flex flex-col border-b pb-4 mb-4 gap-2">
                <h3 className="text-lg font-bold">Dynamic Form</h3>
                <Button onClick={addField} size="sm" variant="secondary" className="w-full mt-2"><Plus className="h-4 w-4 mr-2" /> Add Field</Button>
             </div>

             <div className="space-y-4">
                {fields.map((field, index) => (
                   <div key={field.id} className="p-4 border rounded-lg bg-muted/10 flex flex-col gap-3 relative">
                      <div className="flex justify-between items-center mb-1">
                        <Label className="font-semibold text-primary">Field {index + 1}</Label>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeField(field.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      
                      <div className="space-y-1">
                         <Label className="text-xs text-muted-foreground">Field Label</Label>
                         <Input placeholder="e.g. Full Name" value={field.label} onChange={(e) => updateField(field.id, 'label', e.target.value)} />
                      </div>

                      <div className="space-y-1">
                         <Label className="text-xs text-muted-foreground">Type</Label>
                         <Select value={field.type} onValueChange={(val) => updateField(field.id, 'type', val)}>
                            <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                               {FIELD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                         <Checkbox id={`req-${field.id}`} checked={field.required} onCheckedChange={(c) => updateField(field.id, 'required', !!c)} />
                         <label htmlFor={`req-${field.id}`} className="text-sm font-medium">Required Field</label>
                      </div>

                      {field.type === 'Dropdown' && (
                         <div className="space-y-1 mt-2">
                            <Label className="text-xs text-muted-foreground">Options (Comma separated)</Label>
                            <Input 
                                value={field.rawOptionsDisplay ?? field.options?.join(', ') ?? ''} 
                                onChange={(e) => handleOptionsChange(field.id, e.target.value)} 
                                placeholder="e.g. Option 1, Option 2" 
                            />
                         </div>
                      )}
                   </div>
                ))}
                
                {fields.length === 0 && (
                   <div className="text-center p-6 border-dashed border-2 rounded-xl text-muted-foreground text-sm">
                      No custom fields added. Basic Info is collected natively.
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}
