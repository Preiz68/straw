import { ParsedResume } from "@/lib/ai/parseResumeWithAI";
import { ProjectSummary } from "@/types/project";

export type GeneratedResume = {
  name: string;
  contact: {
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
  };
  summary: string;
  skills: {
    category: string;
    items: string[];
  }[];
  projects: {
    name: string;
    description: string;
    techStack: string[];
    bullets: string[];
  }[];
  experience: string[];
  education: string[];
  certifications: {
    name: string;
    issuer?: string | null;
    date?: string | null;
    link?: string | null;
  }[];
};

type GenerateInput = {
  resume: ParsedResume;
  jd: any;
  role: string;
  rank: string;
  selectedProjects: {
    id: string;
    name: string;
    summary: ProjectSummary;
  }[];
};

export async function generateTailoredResume(
  input: GenerateInput,
): Promise<GeneratedResume> {
  const prompt = buildPrompt(input);
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
            model: "llama-3.3-70b-versatile",
            temperature: attempt === 0 ? 0.15 : 0.25,
            max_tokens: 4000,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "You are an elite Software Engineering Resume Writer. You write powerful, ATS-friendly, achievement-driven resumes. Always return strictly valid JSON with no extra keys. NEVER invent facts, companies, dates, or metrics not present in the candidate's profile.",
              },
              { role: "user", content: prompt },
            ],
          }),
        },
      );

      if (res.status === 429) {
        if (attempt === maxRetries) {
          throw new Error(
            "Groq API rate limit exceeded during resume generation. Please try again in a few moments.",
          );
        }
        const err = await res.json().catch(() => ({}));
        const wait =
          err?.error?.message?.match(/in (\d+\.?\d*)s/)?.[1] != null
            ? parseFloat(err.error.message.match(/in (\d+\.?\d*)s/)[1]) * 1000 +
              500
            : 3000 * (attempt + 1);
        console.log(`⏳ Rate limited. Waiting ${Math.round(wait / 1000)}s…`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) throw new Error(`Groq API error: ${res.status}`);

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      const parsed = safeParse(content);

      if (!parsed) throw new Error("Failed to parse AI resume response");

      // Light coercion — ensure arrays exist even if AI skips them
      return {
        name: parsed.name ?? input.resume.name,
        contact: {
          email: parsed.contact?.email ?? input.resume.email ?? null,
          phone: parsed.contact?.phone ?? input.resume.phone ?? null,
          location: parsed.contact?.location ?? input.resume.location ?? null,
          linkedin: parsed.contact?.linkedin ?? input.resume.linkedin ?? null,
          github: parsed.contact?.github ?? input.resume.github ?? null,
          portfolio:
            parsed.contact?.portfolio ?? input.resume.portfolio ?? null,
        },
        summary: parsed.summary ?? "",
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        certifications: Array.isArray(parsed.certifications)
          ? parsed.certifications
          : [],
      };
    } catch (err) {
      if (attempt === maxRetries) {
        console.error("generateTailoredResume failed:", err);
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  throw new Error("Resume generation failed: Maximum retries reached.");
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt Builder — the heart of the zero-hallucination approach
// ─────────────────────────────────────────────────────────────────────────────
function buildPrompt(input: GenerateInput) {
  const { resume, jd, role, rank, selectedProjects } = input;

  const experienceLevel = deriveLevel(rank);

  const projectsContext = selectedProjects
    .map(
      (p) => `
PROJECT: ${p.summary.name}
Description: ${p.summary.description}
Tech Stack: ${p.summary.techStack.join(", ")}
Key Features: ${p.summary.keyFeatures.join(" | ")}
Challenges: ${p.summary.challenges.join(" | ")}
Impact: ${p.summary.impact}
Complexity: ${p.summary.complexity}`,
    )
    .join("\n---\n");

  return `You are an elite Software Engineering Resume Writer with 15+ years of experience.

Your task: Write a highly tailored, ATS-friendly, achievement-driven resume for the candidate below.

══════════════════════════════════════════════════════════
⚠️  ZERO-HALLUCINATION RULES — NEVER BREAK THESE:
══════════════════════════════════════════════════════════
1. You MUST NOT invent any companies, job titles, dates, metrics, degrees, or skills
   that are not explicitly provided in the CANDIDATE PROFILE or SELECTED PROJECTS below.
2. You MAY rephrase and reorder content for maximum impact and JD alignment.
3. You MAY craft achievement-style bullets from the raw facts given — but every claim
   must be traceable to the provided data.
4. If a field has no data (e.g. no LinkedIn), set it to null in the JSON.
5. Do not add generic filler. Be specific, technical, and honest.

══════════════════════════════════════════════════════════
MASTER RESUME WRITING RULES:
══════════════════════════════════════════════════════════
• Strictly 1-column format (reflected in the JSON structure).
• Every project/experience bullet MUST start with a strong action verb:
  (Engineered, Spearheaded, Optimized, Architected, Accelerated, Reduced,
   Increased, Delivered, Built, Designed, Automated, Integrated, etc.)
• Quantify aggressively but ONLY with real numbers from the source data.
  If no metric exists, focus on technical precision instead.
• Vary sentence structure and action verbs across all bullets.
• Tailor the Summary, Skills order, and top bullets to the TARGET JD below.
• Make metrics and technologies visually prominent in bullet points.

══════════════════════════════════════════════════════════
EXPERIENCE LEVEL ADAPTATION:
══════════════════════════════════════════════════════════
Level: ${experienceLevel}
${
  experienceLevel === "entry"
    ? `→ Make the Projects section the STRONGEST and most detailed section.
→ Summary should highlight project impact and technical breadth, not work history.
→ Craft 4-6 powerful impact bullets per project from the project context provided.`
    : experienceLevel === "junior"
      ? `→ Balance Projects and Experience equally.
→ Strengthen project bullets to compensate for limited work history.
→ Craft 3-5 bullets per project.`
      : `→ Emphasise leadership, system design, business outcomes, and scale.
→ Experience section takes priority over Projects.
→ Keep project descriptions tighter (2-3 bullets each).`
}

══════════════════════════════════════════════════════════
CANDIDATE PROFILE (SOURCE OF TRUTH — do not add facts beyond this)
══════════════════════════════════════════════════════════
Name: ${resume.name}
Email: ${resume.email ?? "Not provided"}
Phone: ${resume.phone ?? "Not provided"}
Location: ${resume.location ?? "Not provided"}
LinkedIn: ${resume.linkedin ?? "Not provided"}
GitHub: ${resume.github ?? "Not provided"}
Portfolio: ${resume.portfolio ?? "Not provided"}
Years of Experience: ${resume.yearsOfExperience ?? "Not specified"}

Original Summary: ${resume.summary}

Skills (raw list): ${resume.skills.join(", ")}

Work Experience (raw):
${resume.experience.length > 0 ? resume.experience.join("\n") : "No formal work experience listed."}

Education (raw):
${resume.education.length > 0 ? resume.education.join("\n") : "Not provided."}

Certifications:
${
  resume.certifications.length > 0
    ? resume.certifications
        .map(
          (c) =>
            `- ${c.name}${c.issuer ? ` – ${c.issuer}` : ""}${c.date ? ` (${c.date})` : ""}${c.link ? ` → ${c.link}` : ""}`,
        )
        .join("\n")
    : "None"
}

══════════════════════════════════════════════════════════
TARGET JOB DESCRIPTION (tailor the resume to this)
══════════════════════════════════════════════════════════
Role Applying For: ${role}
Desired Rank: ${rank}
JD Role: ${jd?.role ?? "Not specified"}
Company: ${jd?.company ?? "Not specified"}
Experience Level Required: ${jd?.experienceLevel ?? "Not specified"}
Required Tech Stack: ${(jd?.techStack ?? []).join(", ")}
Key Requirements: ${(jd?.keyRequirements ?? []).join(" | ")}
Key Signals: ${(jd?.keySignals ?? []).join(" | ")}
Responsibilities: ${(jd?.responsibilities ?? []).join(" | ")}

══════════════════════════════════════════════════════════
AI-SELECTED GITHUB PROJECTS (use these as the Projects section — treat as real work)
══════════════════════════════════════════════════════════
${projectsContext}

══════════════════════════════════════════════════════════
PROFESSIONAL SUMMARY RULES:
══════════════════════════════════════════════════════════
• Write a compelling 4–6 line paragraph (NOT bullets).
• Do NOT start with "Results-oriented", "Passionate", or "Dedicated" as the first words.
• First 1-2 sentences must immediately communicate strongest value and impact.
• Mention key technologies most relevant to the target JD.
• End with the type of role/company impact the candidate seeks.
• Base it ONLY on facts from the candidate profile above.

══════════════════════════════════════════════════════════
SKILLS SECTION RULES:
══════════════════════════════════════════════════════════
• Group into logical categories (e.g. "Languages", "Frameworks & Libraries",
  "Tools & Platforms", "Databases", etc.)
• Reorder categories to put JD-matching skills FIRST.
• Only include skills explicitly listed in the candidate's skills list or project tech stacks.

══════════════════════════════════════════════════════════
OUTPUT FORMAT — Return ONLY this JSON, no extra text:
══════════════════════════════════════════════════════════
{
  "name": "string",
  "contact": {
    "email": "string | null",
    "phone": "string | null",
    "location": "string | null",
    "linkedin": "string | null",
    "github": "string | null",
    "portfolio": "string | null"
  },
  "summary": "string (4-6 line paragraph)",
  "skills": [
    { "category": "string", "items": ["string"] }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string (one powerful line describing what it achieves)",
      "techStack": ["string"],
      "bullets": ["string (action verb + technical detail + impact)"]
    }
  ],
  "experience": ["string (formatted: Title | Company | Date — bullet points)"],
  "education": ["string"],
  "certifications": [
    { "name": "string", "issuer": "string | null", "date": "string | null", "link": "string | null" }
  ]
}

Now generate the resume JSON. Be precise, achievement-driven, and zero-hallucination.`;
}

function deriveLevel(rank: string): "entry" | "junior" | "mid_senior" {
  const r = rank.toLowerCase();
  if (r.includes("intern") || r.includes("entry")) return "entry";
  if (r.includes("junior")) return "junior";
  return "mid_senior";
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
