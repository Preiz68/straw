import { z } from "zod";

export const ParsedResumeSchema = z.object({
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  linkedin: z.string().nullable(),
  github: z.string().nullable(),
  portfolio: z.string().nullable(),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(z.string()),
  education: z.array(z.string()),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string().nullable().optional(),
      date: z.string().nullable().optional(),
      link: z.string().nullable().optional(),
    }),
  ),
  yearsOfExperience: z.number().nullable().optional(),
});

export type ParsedResume = z.infer<typeof ParsedResumeSchema>;

export async function parseResumeWithAI(text: string): Promise<ParsedResume> {
  const prompt = buildResumePrompt(text);
  const maxRetries = 5;

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
            model: "llama-3.1-8b-instant",
            temperature: attempt === 0 ? 0.1 : 0.2,
            max_tokens: 1800,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "You are an expert resume parser and technical recruiter. Extract information accurately and return only valid JSON.",
              },
              { role: "user", content: prompt },
            ],
          }),
        },
      );

      if (res.status === 429) {
        if (attempt === maxRetries) {
          throw new Error("Groq API rate limit exceeded during resume parsing. Please try again in a few moments.");
        }
        const waitTime = 2000 * (attempt + 1);
        console.log(`⏳ Rate limit hit on parseResumeWithAI. Waiting ${waitTime}ms...`);
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }

      if (!res.ok) {
        throw new Error(`Groq API error: ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      const parsed = safeParse(content);
      if (!parsed) {
        throw new Error("Failed to extract valid JSON from Groq response");
      }

      return ParsedResumeSchema.parse(parsed);
    } catch (error) {
      if (attempt === maxRetries) {
        console.error("Resume parsing failed after all retries:", error);
        throw error;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  throw new Error("Resume parsing failed: Maximum retries reached.");
}

function buildResumePrompt(text: string) {
  return `You are an expert resume parser.

Extract all relevant information from the resume text below.

**Return ONLY valid JSON** using this exact schema:

{
  "name": "string",
  "email": "string | null",
  "phone": "string | null",
  "location": "string | null",
  "linkedin": "string | null",
  "github": "string | null",
  "portfolio": "string | null",
  "summary": "string",
  "skills": ["string"],
  "experience": ["string"],
  "education": ["string"],
  "certifications": [
    {
      "name": "string",
      "issuer": "string | null",
      "date": "string | null",
      "link": "string | null"
    }
  ],
  "yearsOfExperience": number | null
}

**EXTRACTION RULES:**
- Extract full name, email, phone, location accurately.
- Look for GitHub, LinkedIn, Portfolio/Personal Website links.
- Extract certifications with links if available.
- Summarize professional summary in 3-5 sentences.
- List technical skills only (languages, frameworks, libraries, tools). EXCLUDE soft skills like "problem solving", "communication", "critical thinking", etc.
- Keep experience and education as clean bullet points.

**RESUME TEXT:**
${text.slice(0, 15000)}
`;
}

function safeParse(text: string | null | undefined): any {
  if (!text?.trim()) return null;

  text = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return null;
  }
}

export async function buildStructuredResume(text: string) {
  return await parseResumeWithAI(text);
}
