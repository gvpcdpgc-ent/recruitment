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
import { Plus, Trash2, Layout, Settings2, FileText, ListChecks, Sparkles } from "lucide-react";

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
    toast.success("New field added at the bottom");
  };

  const addAcademicPresets = () => {
    const presets: FormField[] = [
      { id: `preset_sq_${Date.now()}`, label: "Highest Qualification", type: "Dropdown", required: true, options: ["Ph.D", "NET/SET/SLET", "Post Graduation", "Graduation"] },
      { id: `preset_sp_${Date.now()+1}`, label: "Specialization", type: "Text", required: true },
      { id: `preset_ex_${Date.now()+2}`, label: "Total Teaching Experience (Years)", type: "Number", required: true },
      { id: `preset_in_${Date.now()+3}`, label: "Total Industry Experience (Years)", type: "Number", required: false },
      { id: `preset_cv_${Date.now()+4}`, label: "Updated Resume/CV", type: "File Upload", required: true }
    ];
    setFields([...fields, ...presets]);
    toast.success("Common academic fields added!");
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
         toast.error(data.error || "Failed to save position");
      }

    } catch (e) {
       toast.error("Network error");
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      
      {/* 1. Basic Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-primary border-b pb-2">
           <Settings2 className="h-5 w-5" />
           <h3 className="text-xl font-bold">1. Basic Settings</h3>
        </div>
        
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
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
                 <Label>Deadline (IST)</Label>
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
        </div>
      </section>

      {/* 2. Application Numbering */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-primary border-b pb-2">
           <Layout className="h-5 w-5" />
           <h3 className="text-xl font-bold">2. Application Numbering</h3>
        </div>
        
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
              <Label>App Number Prefix <span className="text-destructive">*</span></Label>
              <Input value={appPrefix} onChange={(e) => setAppPrefix(e.target.value.toUpperCase())} placeholder="e.g. CSE-FAC" />
              <p className="text-[10px] text-muted-foreground uppercase">Format: {appPrefix || 'PREFIX'}-202605-001</p>
           </div>
           <div className="space-y-2">
              <Label>Current Start Counter</Label>
              <Input type="number" value={initialCounter} onChange={(e) => setInitialCounter(parseInt(e.target.value) || 1)} min="1" />
              <p className="text-[10px] text-primary font-medium">Next application will start from this number</p>
           </div>
        </div>
      </section>

      {/* 3. Job Details (HTML Content) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-primary border-b pb-2">
           <FileText className="h-5 w-5" />
           <h3 className="text-xl font-bold">3. Job Description & Content</h3>
        </div>
        
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea className="h-32" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Main job description... (HTML allowed)" />
          </div>
          <div className="space-y-2">
            <Label>Qualifications</Label>
            <Textarea className="h-32" value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="Required qualifications... (HTML allowed)" />
          </div>
          <div className="space-y-2">
            <Label>Additional Instructions</Label>
            <Textarea className="h-24" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions for applicants... (HTML allowed)" />
          </div>
        </div>
      </section>

      {/* 4. Dynamic Form Builder */}
     <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-2 border-primary/20">
           <div className="flex items-center gap-2 text-primary">
              <ListChecks className="h-5 w-5" />
              <h3 className="text-xl font-bold">4. Custom Application Questions</h3>
           </div>
           <div className="flex gap-2">
              <Button onClick={addAcademicPresets} variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/5">
                <Sparkles className="h-4 w-4 mr-2" /> Add Academic Presets
              </Button>
              <Button onClick={addField} size="sm" variant="secondary">
                <Plus className="h-4 w-4 mr-2" /> Add New Field
              </Button>
           </div>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
             <div key={field.id} className="p-6 border rounded-xl bg-card shadow-sm hover:border-primary/30 transition-all flex flex-col md:flex-row gap-6 relative group">
                <div className="absolute -left-3 top-6 bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                   {index + 1}
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                   <div className="md:col-span-5 space-y-1">
                      <Label className="text-xs uppercase font-bold text-muted-foreground">Question / Field Label</Label>
                      <Input placeholder="e.g. Total Teaching Experience" value={field.label} onChange={(e) => updateField(field.id, 'label', e.target.value)} />
                   </div>
                   
                   <div className="md:col-span-3 space-y-1">
                      <Label className="text-xs uppercase font-bold text-muted-foreground">Input Type</Label>
                      <Select value={field.type} onValueChange={(val) => updateField(field.id, 'type', val)}>
                         <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            {FIELD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="md:col-span-2 flex items-center gap-2 pb-2">
                      <Checkbox id={`req-${field.id}`} checked={field.required} onCheckedChange={(c) => updateField(field.id, 'required', !!c)} />
                      <Label htmlFor={`req-${field.id}`} className="text-sm font-medium cursor-pointer">Required</Label>
                   </div>

                   <div className="md:col-span-2 flex justify-end pb-1">
                      <Button variant="ghost" size="sm" className="text-destructive opacity-50 group-hover:opacity-100 hover:bg-destructive/10" onClick={() => removeField(field.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                   </div>
                </div>

                {field.type === 'Dropdown' && (
                   <div className="w-full mt-2 pt-4 border-t border-dashed">
                      <Label className="text-xs uppercase font-bold text-muted-foreground">Options (Split by commas)</Label>
                      <Input 
                        value={field.rawOptionsDisplay ?? field.options?.join(', ') ?? ''} 
                        onChange={(e) => handleOptionsChange(field.id, e.target.value)} 
                        placeholder="e.g. Ph.D, Masters, Bachelors" 
                        className="mt-1"
                      />
                   </div>
                )}
             </div>
          ))}

          {fields.length === 0 && (
             <div className="text-center py-12 border-dashed border-2 rounded-2xl bg-muted/20 text-muted-foreground">
                <Layout className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No custom questions added yet.</p>
                <p className="text-sm">Click "Add New Field" or use a "Preset" to get started.</p>
             </div>
          )}
        </div>
      </section>

      {/* Global Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 z-50 flex justify-center gap-4 shadow-2xl">
         <div className="max-w-4xl w-full flex justify-between gap-4">
            <Button variant="outline" size="lg" onClick={() => router.back()} disabled={isLoading}>
               Cancel
            </Button>
            <Button onClick={handleSave} size="lg" className="px-12 shadow-lg hover:shadow-primary/20 transition-all font-bold" disabled={isLoading}>
               {isLoading ? "Saving..." : initialData?.id ? "Update Position" : "Create Position"}
            </Button>
         </div>
      </div>
      
    </div>
  );
}
