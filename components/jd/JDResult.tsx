export default function JDResult({ data }: { data: any }) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="text-xl font-semibold">{data.title}</h2>

      <div>
        <strong>Role Type:</strong> {data.role || "N/A"}
      </div>

      <div>
        <strong>Seniority:</strong> {data.experienceLevel || "N/A"}
      </div>

      <div>
        <strong>Technologies:</strong>
        <ul>
          {data.techStack?.map((t: string, i: number) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>

      <div>
        <strong>Required Skills:</strong>
        <ul>
          {data.keyRequirements?.map((s: string, i: number) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
