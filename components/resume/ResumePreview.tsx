export default function ResumePreview({ data }: { data: any }) {
  return (
    <div className="border rounded-lg p-4 space-y-6">
      <h2 className="text-xl font-semibold">Resume Preview</h2>

      {/* SUMMARY */}
      <div>
        <h3 className="font-semibold">Summary</h3>
        <p>{data.summary || "N/A"}</p>
      </div>

      {/* SKILLS */}
      <div>
        <h3 className="font-semibold">Skills</h3>
        <ul className="list-disc ml-6">
          {data.skills?.map((skill: string, i: number) => (
            <li key={i}>{skill}</li>
          ))}
        </ul>
      </div>

      {/* EXPERIENCE */}
      <div>
        <h3 className="font-semibold">Experience</h3>
        <ul className="list-disc ml-6">
          {data.experience?.map((exp: string, i: number) => (
            <li key={i}>{exp}</li>
          ))}
        </ul>
      </div>

      {/* EDUCATION */}
      <div>
        <h3 className="font-semibold">Education</h3>
        <ul className="list-disc ml-6">
          {data.education?.map((edu: string, i: number) => (
            <li key={i}>{edu}</li>
          ))}
        </ul>
      </div>

      {/* NEXT STEP BUTTON */}
      <button className="mt-4 px-4 py-2 bg-black text-white rounded-lg">
        Continue → Match with Job
      </button>
    </div>
  );
}
