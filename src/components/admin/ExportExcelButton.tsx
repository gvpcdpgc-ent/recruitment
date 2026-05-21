"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function ExportExcelButton({ applications, positionTitle = "All Applications" }: { applications: any[], positionTitle?: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (applications.length === 0) {
      toast.error("No applications to export");
      return;
    }

    setIsExporting(true);
    try {
      // Group applications by Department
      const groupedData: Record<string, any[]> = {};

      applications.forEach(app => {
        // Safe extraction of nested relations
        const pos = app.positions as any;
        const deptName = pos?.departments?.name || "General";
        
        // Clean sheet name (Excel limits to 31 chars and no special characters)
        const safeSheetName = deptName.replace(/[\*\?\/\\\[\]:]/g, "").substring(0, 31);
        
        if (!groupedData[safeSheetName]) groupedData[safeSheetName] = [];

        // Safe extraction of the schema (resolves object vs array constraint issue)
        const pf = pos?.position_forms;
        const pfData = Array.isArray(pf) ? (pf.length > 0 ? pf[0] : null) : pf;
        const schema = pfData?.schema_json || [];

        // Map field IDs to Labels
        const labelMap: Record<string, string> = {};
        if (Array.isArray(schema)) {
           schema.forEach((f: any) => {
              if (f.id && f.label) labelMap[f.id] = f.label;
           });
        }

        // Build the row
        const row: any = {
           "App Number": app.application_number,
           "Status": app.status,
           "Candidate Name": app.candidate_name,
           "Email": app.candidate_email,
           "Phone": app.candidate_phone,
           "DOB": app.candidate_dob || "N/A",
           "Applied At": new Date(app.applied_at).toLocaleString(),
           "Position": pos?.title || "Unknown",
           "Photograph": app.photo_url || "Not provided"
        };

        // Add dynamic responses
        if (app.dynamic_responses_json) {
           Object.entries(app.dynamic_responses_json).forEach(([key, value]) => {
              // If it's undefined, we ignore it or treat it as a file
              if (value !== undefined && value !== null) {
                const header = labelMap[key] || `Custom_${key}`;
                row[header] = Array.isArray(value) ? value.join(", ") : value;
              }
           });
        }

        // Add File Upload Links
        if (Array.isArray(app.application_files)) {
           const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
           app.application_files.forEach((fileReq: any) => {
              const header = labelMap[fileReq.field_name] || `Document_${fileReq.field_name}`;
              // file_url typically contains the bucket path, make it a fully qualified URL if possible
              const fullUrl = fileReq.file_url.startsWith('http') 
                ? fileReq.file_url 
                : `${supabaseUrl}/storage/v1/object/public/documents/${fileReq.file_url}`;
              row[header] = fullUrl;
           });
        }

        groupedData[safeSheetName].push(row);
      });

      // Create a Workbook
      const workbook = XLSX.utils.book_new();

      // Create a Sheet for each Department
      Object.keys(groupedData).forEach(sheetName => {
        const worksheet = XLSX.utils.json_to_sheet(groupedData[sheetName]);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });
      
      const fileName = `Applications_${positionTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success("Excel exported successfully");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to export Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Export Excel"}
    </Button>
  );
}
