"use client";

import { useState } from "react";

export default function ResumeUpload({
  onParsedAction,
  setLoadingAction,
}: {
  onParsedAction: (data: any) => void;
  setLoadingAction: (val: boolean) => void;
}) {
  const [fileName, setFileName] = useState("");

  const handleUpload = async (file: File) => {
    setLoadingAction(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error:", text);
        throw new Error("Failed to parse resume");
      }

      const data = await res.json();
      onParsedAction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />

      {fileName && <p className="text-sm">Uploaded: {fileName}</p>}
    </div>
  );
}
