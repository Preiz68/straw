import { parseResumeFile } from "@/lib/resume/parseResume";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No file uploaded");
    }

    const parsed = await parseResumeFile(file);

    return Response.json(parsed);
  } catch (err: any) {
    console.error("PARSE RESUME ERROR:", err);

    return Response.json(
      { error: err.message || "Failed to parse resume" },
      { status: 500 },
    );
  }
}
