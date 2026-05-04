import { useState } from "react";

export default function GitHubInput({
  onSubmit,
  loading,
}: {
  onSubmit: (username: string) => void;
  loading: boolean;
}) {
  const [username, setUsername] = useState("");

  return (
    <div className="flex flex-col gap-4 w-96">
      <input
        className="border p-3 rounded"
        placeholder="GitHub username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button
        className="bg-black text-white p-3 rounded"
        onClick={() => onSubmit(username)}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze GitHub"}
      </button>
    </div>
  );
}
