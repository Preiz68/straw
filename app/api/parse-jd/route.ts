import { parseJobDescription } from "@/lib/ai/parseJobDescription";

export async function POST(req: Request) {
  try {
    const { jdText } = await req.json();

    const parsed = await parseJobDescription(jdText);

    return Response.json(parsed);
  } catch (err: any) {
    console.error(err);

    return Response.json(
      { error: err.message || "Failed to parse JD" },
      { status: 500 },
    );
  }
}
