// @ts-ignore
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { buildStructuredResume } from "../ai/parseResumeWithAI";

export async function parseResumeFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log("🔍 Extracting text...");

  const result = await pdfParse(buffer);

  const text = result.text;

  if (!text || text.trim().length < 120) {
    throw new Error("PDF likely scanned or image-based");
  }

  const structuredResume = await buildStructuredResume(text);

  console.log(" STRUCTURED RESUME: ", structuredResume);
  return structuredResume;
}
