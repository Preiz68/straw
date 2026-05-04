"use client";

import { useState } from "react";
import JDInput from "@/components/jd/JDInput";
import JDResult from "@/components/jd/JDResult";

export default function JDPage() {
  const [parsedJD, setParsedJD] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleParse = async (jdText: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/parse-jd", {
        method: "POST",
        body: JSON.stringify({ jdText }),
      });

      const data = await res.json();
      console.log(data);
      setParsedJD(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Paste Job Description</h1>

      <JDInput onParseAction={handleParse} loading={loading} />

      {parsedJD && <JDResult data={parsedJD} />}
    </div>
  );
}
