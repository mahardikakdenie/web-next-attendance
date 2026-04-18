"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { PayslipPDFDocument } from "@/components/ui/PayslipPDFDocument";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { PayrollCalculationResult } from "@/types/api";

interface DynamicPDFDownloadProps {
  data: PayrollCalculationResult;
  companyName: string;
  logo?: string;
  ptkp: string;
  period: string;
  employeeName: string;
  employeeRole: string;
  fileName: string;
}

export default function DynamicPDFDownload({
  data,
  companyName,
  logo,
  ptkp,
  period,
  employeeName,
  employeeRole,
  fileName
}: DynamicPDFDownloadProps) {
  return (
    <PDFDownloadLink
      document={
        <PayslipPDFDocument 
          data={data} 
          companyName={companyName} 
          logo={logo}
          ptkp={ptkp}
          period={period}
          employeeName={employeeName}
          employeeRole={employeeRole}
        />
      }
      fileName={fileName}
    >
      {({ loading }) => (
        <Button 
          disabled={loading} 
          className="w-full bg-indigo-600 text-white h-14 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
        >
          <Download size={20} />
          <span>{loading ? "Preparing PDF..." : "Export Official Slip"}</span>
        </Button>
      )}
    </PDFDownloadLink>
  );
}
