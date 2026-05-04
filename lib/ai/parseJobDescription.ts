import { ParsedJDSchema } from "@/types/job";

export async function parseJobDescription(jdText: string) {
  const prompt = buildPrompt(jdText);
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: attempt === 0 ? 0.1 : 0.25,
            max_tokens: 1200,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "You are an expert technical recruiter. Always return valid JSON. Never return null for company name - use 'Not specified' instead.",
              },
              { role: "user", content: prompt },
            ],
          }),
        },
      );

      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1800 * (attempt + 1)));
        continue;
      }

      if (!res.ok) {
        throw new Error(`Groq API error: ${res.status}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();

      const parsed = safeParse(text);
      if (!parsed) {
        throw new Error("Failed to extract valid JSON");
      }

      return ParsedJDSchema.parse(parsed);
    } catch (error) {
      if (attempt === maxRetries) {
        console.error("JD Parsing failed after retries:", error);
        throw error;
      }
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  throw new Error("Unexpected end of parseJobDescription");
}
function buildPrompt(jdText: string) {
  return `You are an expert technical recruiter and hiring manager.

Extract structured information from the job description below. Be precise and comprehensive.

**Return ONLY valid JSON matching this schema:**

{
  "role": "string",
  "company": "string",
  "location": "string",
  "type": "Full-time" | "Contract" | "Remote" | "Hybrid" | "On-site",
  "experienceLevel": "Junior" | "Mid" | "Senior" | "Staff" | "Principal",
  "description": "string",
  "keyRequirements": ["string"],
  "techStack": ["string"],
  "niceToHave": ["string"],
  "responsibilities": ["string"],
  "salaryRange": "string | null",
  "keySignals": ["string"]
}

**EXTRACTION RULES:**

- "role": Use the main job title (e.g. "Software Engineer")
- "company": Extract company name if mentioned, otherwise "Not specified"
- "location": Extract location / remote info
- "type": Choose the best match from the enum
- "experienceLevel": Infer from context (Seniority)
- "techStack": List all technologies mentioned (e.g. React, Python, Node.js, AWS, etc.)
- "keyRequirements": Must-have skills and qualifications
- "responsibilities": Extract all responsibilities clearly
- "keySignals": Highlight strong signals (e.g. "AWS distributed environments", "expert-level React", etc.)
- Never return null for "role", "description", or "company" — use "Not specified" instead.

**JOB DESCRIPTION:**
${jdText}

Analyze carefully and generate the JSON.`;
}

function safeParse(text: string | null | undefined) {
  if (!text) return null;
  text = text.replace(/```json\n?|\n?```/g, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}
