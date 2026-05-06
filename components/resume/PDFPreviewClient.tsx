"use client";

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { ResumeDocument } from "./ResumeDocument";
import { GeneratedResume } from "@/lib/ai/generateTailoredResume";

export function PDFPreviewClient({ data }: { data: GeneratedResume }) {
  const fileName = `${data.name.replace(/\s+/g, "_")}_Resume.pdf`;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Download Button */}
      <div className="flex justify-end">
        <PDFDownloadLink
          document={<ResumeDocument data={data} />}
          fileName={fileName}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all duration-200 shadow-lg shadow-indigo-900/30 no-underline"
        >
          {({ loading }) =>
            loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Preparing PDF…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </>
            )
          }
        </PDFDownloadLink>
      </div>

      {/* Inline PDF Preview */}
      {/* Inline PDF Preview */}
      <div className="w-full h-[75vh] min-h-[600px] rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-white">
        <PDFViewer 
          width="100%" 
          height="100%" 
          showToolbar={false} 
          style={{ border: "none" }}
        >
          <ResumeDocument data={data} />
        </PDFViewer>
      </div>
    </div>
  );
}
