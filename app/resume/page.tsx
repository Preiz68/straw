"use client";

import { useState } from "react";
import ResumeUpload from "@/components/resume/ResumeUpload";
import ResumePreview from "@/components/resume/ResumePreview";

export default function ResumePage() {
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleParsed = (data: any) => {
    setResume(data);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Upload Resume</h1>

      <ResumeUpload
        onParsedAction={handleParsed}
        setLoadingAction={setLoading}
      />

      {loading && <p>Parsing resume...</p>}

      {resume && <ResumePreview data={resume} />}
    </div>
  );
}
