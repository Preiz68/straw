"use client";

import { useState } from "react";

export default function JDInput({
  onParseAction,
  loading,
}: {
  onParseAction: (text: string) => void;
  loading: boolean;
}) {
  const [jdText, setJdText] = useState("");

  return (
    <div className="space-y-4">
      <textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste job description here..."
        className="w-full h-60 p-4 border rounded-lg"
      />

      <button
        onClick={() => onParseAction(jdText)}
        disabled={loading || !jdText}
        className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Parsing..." : "Parse Job Description"}
      </button>
    </div>
  );
}
