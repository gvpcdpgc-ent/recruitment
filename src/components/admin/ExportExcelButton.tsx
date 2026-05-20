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
      // Flatten the data for Excel
      const data = applications.map(app => {
        const row: any = {
           "App Number": app.application_number,
           "Status": app.status,
           "Candidate Name": app.candidate_name,
           "Email": app.candidate_email,
           "Phone": app.candidate_phone,
           "DOB": app.candidate_dob || "N/A",
           "Applied At": new Date(app.applied_at).toLocaleString(),
           "Position": (app.positions as any)?.title || "Unknown"
        };

        // Get labels from schema if available
        const schema = (app.positions as any)?.position_forms?.[0]?.schema_json || [];
        const labelMap: Record<string, string> = {};
        if (Array.isArray(schema)) {
           schema.forEach((f: any) => {
              if (f.id && f.label) labelMap[f.id] = f.label;
           });
        }

        // Add dynamic responses with labels as headers
        if (app.dynamic_responses_json) {
           Object.entries(app.dynamic_responses_json).forEach(([key, value]) => {
              const header = labelMap[key] || `Field_${key}`;
              row[header] = value;
           });
        }

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
      
      const fileName = `Applications_${positionTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success("Excel exported with labels");
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
