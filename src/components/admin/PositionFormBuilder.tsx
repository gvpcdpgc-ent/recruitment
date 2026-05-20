"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Layout, Settings2, FileText, ListChecks, Sparkles, X, Download } from "lucide-react";

interface FormField {
   id: string;
   label: string;
   type: string;
   required: boolean;
   options?: string[]; 
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

  const [fields, setFields] = useState<FormField[]>(initialData?.dynamic_form_schema || []);
  const [newOptionInput, setNewOptionInput] = useState<Record<string, string>>({});
  
  // For field cloning
  const [availablePositions, setAvailablePositions] = useState<{id: string, title: string, schema: any[]}[]>([]);
  const [selectedPosToImport, setSelectedPosToImport] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/positions/forms")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
           setAvailablePositions(data.positions);
        }
      });
  }, []);

  const addField = () => {
    setFields([...fields, { 
      id: `field_${Date.now()}`, 
      label: "", 
      type: "Text", 
      required: false,
      options: []
    }]);
    toast.success("New field added");
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
    toast.success("Presets added!");
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

  const addOption = (fieldId: string) => {
    const val = newOptionInput[fieldId];
    if (!val) return;
    
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, options: [...(f.options || []), val] };
      }
      return f;
    }));
    setNewOptionInput({ ...newOptionInput, [fieldId]: "" });
  };

  const removeOption = (fieldId: string, index: number) => {
     setFields(fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, options: (f.options || []).filter((_, i) => i !== index) };
      }
      return f;
    }));
  };

  const handleImportFields = () => {
    const pos = availablePositions.find(p => p.id === selectedPosToImport);
    if (!pos || !pos.schema) return;
    
    // Add prefix to IDs to avoid collisions
    const clonedFields = pos.schema.map(f => ({
       ...f,
       id: `cloned_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    }));

    setFields([...fields, ...clonedFields]);
    toast.success(`Imported ${clonedFields.length} fields from ${pos.title}`);
    setSelectedPosToImport("");
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
         toast.success(`Position saved successfully!`);
         router.push("/gvp-admin/positions");
         router.refresh();
      } else {
         toast.error(data.error || "Failed to save");
      }

    } catch (e) {
       toast.error("Network error");
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32">
      
      {/* 1. Basic Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-primary border-b pb-2">
           <Settings2 className="h-5 w-5" />
           <h3 className="text-lg font-bold">Basic Settings</h3>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label className="text-xs uppercase text-muted-foreground">Position Title <span className="text-destructive">*</span></Label>
                 <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Assistant Professor" />
              </div>
              <div className="space-y-2">
                 <Label className="text-xs uppercase text-muted-foreground">Department</Label>
                 <Select value={departmentId} onValueChange={val => setDepartmentId(val || '')}>
                    <SelectTrigger>
                      {departmentId && departments.some(d => d.id === departmentId) ? (
                        <span className="flex-1 text-left truncate overflow-hidden text-ellipsis line-clamp-1">{departments.find(d => d.id === departmentId)?.name}</span>
                      ) : (
                        <SelectValue placeholder="Select Department..." />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                       {departments.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                    </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                 <Label className="text-xs uppercase text-muted-foreground">Deadline (IST)</Label>
                 <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div className="space-y-2">
                 <Label className="text-xs uppercase text-muted-foreground">Initial Status</Label>
                 <Select value={status} onValueChange={val => setStatus(val || 'hidden')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="open">Open</SelectItem>
                       <SelectItem value="closed">Closed</SelectItem>
                       <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
          </div>
        </div>
      </section>

      {/* 2. Numbering */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-primary border-b pb-2">
           <Layout className="h-5 w-5" />
           <h3 className="text-lg font-bold">Application Numbering</h3>
        </div>
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">App Number Prefix</Label>
              <Input value={appPrefix} onChange={(e) => setAppPrefix(e.target.value.toUpperCase())} placeholder="e.g. CSE-FAC" />
              <p className="text-[10px] text-muted-foreground uppercase">Format: {appPrefix || 'PREFIX'}-202605-001</p>
           </div>
           <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Start Counter</Label>
              <Input type="number" value={initialCounter} onChange={(e) => setInitialCounter(parseInt(e.target.value) || 1)} min="1" />
           </div>
        </div>
      </section>

      {/* 3. Job Description */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-primary border-b pb-2">
           <FileText className="h-5 w-5" />
           <h3 className="text-lg font-bold">Job Description & Content</h3>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="space-y-2"><Label className="text-xs uppercase text-muted-foreground">Description</Label><Textarea className="h-32" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs uppercase text-muted-foreground">Qualifications</Label><Textarea className="h-32" value={qualifications} onChange={(e) => setQualifications(e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-xs uppercase text-muted-foreground">Instructions</Label><Textarea className="h-24" value={instructions} onChange={(e) => setInstructions(e.target.value)} /></div>
        </div>
      </section>

      {/* 4. Dynamic Form */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-2 border-primary/20">
           <div className="flex items-center gap-3 text-primary">
              <ListChecks className="h-5 w-5" />
              <h3 className="text-lg font-bold text-left">Application Custom Questions</h3>
           </div>
           <div className="flex flex-wrap gap-2">
              <div className="flex gap-2 items-center bg-muted/50 p-1 rounded-md border border-dashed">
                 <Select value={selectedPosToImport} onValueChange={(val) => setSelectedPosToImport(val || "")}>
                    <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="Import from Position..." /></SelectTrigger>
                    <SelectContent>
                       {availablePositions.filter(p => p.id !== initialData?.id).map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
                 <Button onClick={handleImportFields} variant="ghost" size="sm" className="h-8 text-xs" disabled={!selectedPosToImport}>
                    <Download className="h-3.5 w-3.5 mr-1" /> Import
                 </Button>
              </div>
              <Button onClick={addAcademicPresets} variant="outline" size="sm" className="text-xs border-primary/30 hover:bg-primary/5">
                <Sparkles className="h-4 w-4 mr-1" /> Presets
              </Button>
              <Button onClick={addField} size="sm" variant="secondary" className="text-xs">
                <Plus className="h-4 w-4 mr-1" /> Add Field
              </Button>
           </div>
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => (
             <div key={field.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden text-left">
                <div className="bg-muted/30 px-6 py-3 border-b flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-black">{index + 1}</span>
                      <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Field Settings</span>
                   </div>
                   <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-8 px-2" onClick={() => removeField(field.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Field
                   </Button>
                </div>
                
                <div className="p-6 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-xs uppercase font-bold text-muted-foreground">Question / Label</Label>
                         <Input value={field.label} onChange={(e) => updateField(field.id, 'label', e.target.value)} placeholder="e.g. Total Experience" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-xs uppercase font-bold text-muted-foreground">Input Type</Label>
                         <Select value={field.type} onValueChange={(val) => updateField(field.id, 'type', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                               {FIELD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <Checkbox id={`req-${field.id}`} checked={field.required} onCheckedChange={(c) => updateField(field.id, 'required', !!c)} />
                      <Label htmlFor={`req-${field.id}`} className="text-sm font-medium cursor-pointer">Mark as Mandatory / Required</Label>
                   </div>

                   {field.type === 'Dropdown' && (
                      <div className="pt-6 border-t space-y-4">
                         <Label className="text-xs uppercase font-bold text-primary">Dropdown Selection Options</Label>
                         <div className="flex flex-wrap gap-2">
                            {field.options?.map((opt, i) => (
                               <div key={i} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium group transition-all hover:bg-primary/20 border border-primary/20">
                                  {opt}
                                  <button onClick={() => removeOption(field.id, i)} className="ml-1 text-primary/50 hover:text-destructive">
                                     <X className="h-3 w-3" />
                                  </button>
                               </div>
                            ))}
                            {(!field.options || field.options.length === 0) && (
                               <p className="text-xs text-muted-foreground italic">No options added. Use the box below to add some.</p>
                            )}
                         </div>
                         <div className="flex items-center gap-2 max-w-sm">
                            <Input 
                               placeholder="Type an option..." 
                               value={newOptionInput[field.id] || ""}
                               onChange={(e) => setNewOptionInput({ ...newOptionInput, [field.id]: e.target.value })}
                               onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                     e.preventDefault();
                                     addOption(field.id);
                                  }
                               }}
                            />
                            <Button size="icon" variant="default" className="shrink-0" onClick={() => addOption(field.id)}>
                               <Plus className="h-4 w-4" />
                            </Button>
                         </div>
                         <p className="text-[10px] text-muted-foreground">Type option and press Enter or click the "+" button.</p>
                      </div>
                   )}
                </div>
             </div>
          ))}

          {fields.length === 0 && (
             <div className="text-center py-16 border-dashed border-2 rounded-2xl bg-muted/20 text-muted-foreground">
                <p className="font-medium text-lg">No custom questions added.</p>
                <p className="text-sm">Click "Add Field" to start building your application form.</p>
             </div>
          )}
        </div>
      </section>

      {/* Global Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t p-4 z-50 flex justify-center gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
         <div className="max-w-4xl w-full flex justify-between gap-4">
            <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSave} className="flex-1 max-w-[200px] font-bold" disabled={isLoading}>
               {isLoading ? "Saving..." : initialData?.id ? "Update Position" : "Create Position"}
            </Button>
         </div>
      </div>
    </div>
  );
}
