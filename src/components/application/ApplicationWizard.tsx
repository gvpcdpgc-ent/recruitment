"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const step1Schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone is required"),
});

export type Step1Data = z.infer<typeof step1Schema>;

interface ApplicationWizardProps {
  positionId: string;
  positionTitle: string;
  formSchemaJson?: any[]; 
}

export function ApplicationWizard({ positionId, positionTitle, formSchemaJson = [] }: ApplicationWizardProps) {
  const [step, setStep] = useState(1);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [appNumber, setAppNumber] = useState("");
  
  const [candidateData, setCandidateData] = useState<Step1Data | null>(null);
  const [dynamicResponses, setDynamicResponses] = useState<Record<string, any>>({});
  const [filesData, setFilesData] = useState<Record<string, File>>({});
  
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  const onStep1Submit = async (data: Step1Data) => {
    try {
      const res = await fetch("/api/applications/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, position_id: positionId }),
      });
      const result = await res.json();
      
      if (result.exists) {
        setDuplicateMessage("You have already applied for this position.");
        setAppNumber(result.application_number);
        return;
      }
      
      setCandidateData(data);
      setStep(2);
      toast.success("Details verified. Proceeding to the form.");
    } catch (e) {
      toast.error("Failed to verify details. Please try again.");
    }
  };

  const handleDynamicChange = (id: string, value: any) => {
    setDynamicResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (id: string, file: File) => {
    setFilesData(prev => ({ ...prev, [id]: file }));
  };

  const validateDynamicStep = () => {
    const missingFields = formSchemaJson.filter(f => f.required && f.type !== 'File Upload' && !dynamicResponses[f.id]);
    if (missingFields.length > 0) {
      toast.error(`Please fill all required fields`);
      return false;
    }
    return true;
  };

  const validateFilesStep = () => {
    const missingFields = formSchemaJson.filter(f => f.required && f.type === 'File Upload' && !filesData[f.id]);
    if (missingFields.length > 0) {
      toast.error(`Please upload all required files`);
      return false;
    }
    return true;
  };

  const onFinalSubmit = async () => {
    setIsFinalSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("positionId", positionId);
      formData.append("fullName", candidateData!.fullName);
      formData.append("email", candidateData!.email);
      formData.append("phone", candidateData!.phone);
      formData.append("dynamicResponses", JSON.stringify(dynamicResponses));
      if (photoFile) formData.append("photo", photoFile);

      Object.entries(filesData).forEach(([key, file]) => {
        formData.append(`file_${key}`, file);
      });

      const res = await fetch("/api/applications/submit", {
         method: "POST",
         body: formData,
      });

      const result = await res.json();
      if (result.success) {
         setAppNumber(result.applicationNumber);
         setStep(5);
         toast.success("Application submitted successfully!");
      } else {
         toast.error(result.error || "Failed to submit application");
      }
    } catch (e) {
      toast.error("An error occurred during submission.");
    } finally {
      setIsFinalSubmitting(false);
    }
  };

  const fileFields = formSchemaJson.filter(f => f.type === 'File Upload');
  const otherFields = formSchemaJson.filter(f => f.type !== 'File Upload');

  if (duplicateMessage || step === 5) {
    return (
      <div className="bg-primary/5 p-8 rounded-2xl border text-center space-y-4">
        <h4 className="font-bold text-2xl text-primary">
          {step === 5 ? "Success! Application Submitted." : duplicateMessage}
        </h4>
        <div className="bg-card p-4 rounded-lg inline-block border shadow-sm">
           <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Application Number</p>
           <p className="font-mono font-bold text-3xl">{appNumber}</p>
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
          Please save this application number for your records. A confirmation email has been sent.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 text-left">
      <Progress value={(step / 4) * 100} className="h-2" />
      
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in flex flex-col">
          <div>
            <h3 className="text-xl font-semibold">Basic Details</h3>
            <p className="text-sm text-muted-foreground">Please enter your basic information to begin.</p>
          </div>
          
          <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input id="fullName" {...register("fullName")} placeholder="" />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
              <Input id="email" type="email" {...register("email")} placeholder="" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
              <Input id="phone" type="tel" {...register("phone")} placeholder="" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Passport Photo <span className="text-destructive">*</span></Label>
              <div className="flex items-start gap-4">
                {photoPreview && (
                  <div className="flex-shrink-0">
                    <img src={photoPreview} alt="preview" className="w-20 h-24 object-cover rounded-md border shadow-sm" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { toast.error("Photo must be under 2MB"); e.target.value = ''; return; }
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">JPG/PNG only. Max 2MB.</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting || !photoFile}>
                {isSubmitting ? "Verifying..." : "Continue"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in flex flex-col">
          <div>
            <h3 className="text-xl font-semibold">Dynamic Details</h3>
            <p className="text-sm text-muted-foreground">Please fill out the position specific fields.</p>
          </div>
          
          <div className="space-y-6">
            {otherFields.length > 0 ? otherFields.map(f => (
               <div key={f.id} className="space-y-2">
                  <Label htmlFor={f.id}>{f.label} {f.required && <span className="text-destructive">*</span>}</Label>
                  
                  {f.type === 'Text' && (
                     <Input 
                       id={f.id} 
                       value={dynamicResponses[f.id] || ''} 
                       onChange={e => handleDynamicChange(f.id, e.target.value)} 
                       placeholder={f.placeholder} 
                     />
                  )}
                  {f.type === 'Email' && (
                     <Input 
                       type="email"
                       id={f.id} 
                       value={dynamicResponses[f.id] || ''} 
                       onChange={e => handleDynamicChange(f.id, e.target.value)} 
                       placeholder={f.placeholder} 
                     />
                  )}
                   {f.type === 'Number' && (
                     <Input 
                       type="number"
                       id={f.id} 
                       value={dynamicResponses[f.id] || ''} 
                       onChange={e => handleDynamicChange(f.id, e.target.value)} 
                       placeholder={f.placeholder} 
                     />
                  )}
                  {f.type === 'Textarea' && (
                     <Textarea 
                       id={f.id} 
                       value={dynamicResponses[f.id] || ''} 
                       onChange={e => handleDynamicChange(f.id, e.target.value)} 
                       placeholder={f.placeholder} 
                     />
                  )}
                  {f.type === 'Dropdown' && (
                     <Select value={dynamicResponses[f.id] || ''} onValueChange={(val) => handleDynamicChange(f.id, val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {f.options?.map((opt: string) => (
                             <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                     </Select>
                  )}
               </div>
            )) : <p className="text-muted-foreground italic text-sm">No additional fields required.</p>}
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => validateDynamicStep() && setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

       {step === 3 && (
        <div className="space-y-6 animate-in fade-in flex flex-col">
          <div>
            <h3 className="text-xl font-semibold">Document Uploads</h3>
            <p className="text-sm text-muted-foreground">Upload the required documents (PDF, JPG, PNG).</p>
          </div>
          
           <div className="space-y-6">
            {fileFields.length > 0 ? fileFields.map(f => (
               <div key={f.id} className="space-y-2 bg-muted/50 p-4 border rounded-lg">
                  <Label htmlFor={f.id} className="font-semibold">{f.label} {f.required && <span className="text-destructive">*</span>}</Label>
                  <p className="text-xs text-muted-foreground mb-2">Allowed: PDF, JPG, PNG. Max size: 5MB.</p>
                  <Input 
                    id={f.id} 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => {
                       if (e.target.files && e.target.files[0]) {
                          if (e.target.files[0].size > 5 * 1024 * 1024) {
                             toast.error("File exceeds 5MB logic limit.");
                             e.target.value = '';
                             return;
                          }
                          handleFileChange(f.id, e.target.files[0]);
                       }
                    }} 
                  />
                  {filesData[f.id] && <p className="text-sm text-primary font-medium mt-2">Attached: {filesData[f.id].name}</p>}
               </div>
            )) : <p className="text-muted-foreground italic text-sm">No files requested for this position.</p>}
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => validateFilesStep() && setStep(4)}>Continue</Button>
          </div>
        </div>
      )}

       {step === 4 && (
        <div className="space-y-6 animate-in fade-in flex flex-col">
          <div>
            <h3 className="text-xl font-semibold">Review & Submit</h3>
            <p className="text-sm text-muted-foreground">Please review your submission carefully.</p>
          </div>
          
          <div className="bg-muted/30 border p-6 rounded-xl space-y-6 text-sm">
            <div className="space-y-1 pb-4 border-b">
              <h4 className="font-bold text-foreground/80 tracking-wider uppercase text-xs mb-2">Basic Details</h4>
              <div className="flex items-start gap-4">
                {photoPreview && <img src={photoPreview} alt="photo" className="w-16 h-20 object-cover rounded border flex-shrink-0" />}
                <div>
                  <p><span className="font-semibold">Name:</span> {candidateData?.fullName}</p>
                  <p><span className="font-semibold">Email:</span> {candidateData?.email}</p>
                  <p><span className="font-semibold">Phone:</span> {candidateData?.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-1 pb-4 border-b">
               <h4 className="font-bold text-foreground/80 tracking-wider uppercase text-xs mb-2">Dynamic Responses</h4>
               {Object.entries(dynamicResponses).map(([k, v]) => {
                  const field = formSchemaJson.find(f => f.id === k);
                  return <p key={k}><span className="font-semibold">{field?.label || k}:</span> {v}</p>
               })}
               {Object.keys(dynamicResponses).length === 0 && <p className="text-muted-foreground">None</p>}
            </div>

             <div className="space-y-1">
               <h4 className="font-bold text-foreground/80 tracking-wider uppercase text-xs mb-2">Attached Files</h4>
               {Object.entries(filesData).map(([k, v]) => {
                  const field = formSchemaJson.find(f => f.id === k);
                  return <p key={k} className="flex items-center gap-2">📄 <span className="font-semibold">{field?.label || k}:</span> {v.name}</p>
               })}
               {Object.keys(filesData).length === 0 && <p className="text-muted-foreground">None</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} disabled={isFinalSubmitting}>Back</Button>
            <Button onClick={onFinalSubmit} disabled={isFinalSubmitting}>
               {isFinalSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
