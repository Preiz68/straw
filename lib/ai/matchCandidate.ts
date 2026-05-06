import { z } from "zod";
import { MatchResult, MatchResultSchema } from "@/types/match";
import { StoredProject } from "@/lib/projects/fetchProjectSummaries";

type MatchInput = {
  role: string;
  rank: string;
  resume: any;
  jd: any;
  projects: StoredProject[];
};

export async function matchCandidate(input: MatchInput): Promise<MatchResult> {
  const { role, rank, resume, jd, projects } = input;

  const prompt = buildPrompt({ role, rank, resume, jd, projects });
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          temperature: attempt === 0 ? 0.1 : 0.2,
          max_tokens: 1500,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a senior technical recruiter and hiring manager. You evaluate developer candidates against job descriptions and return precise, honest assessments as valid JSON.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (res.status === 429) {
        if (attempt === maxRetries) {
          throw new Error("Groq API rate limit exceeded during matching. Please try again in a few moments.");
        }
        const waitTime = 2000 * (attempt + 1);
        console.log(`⏳ Rate limit hit on matchCandidate. Waiting ${waitTime}ms...`);
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }

      if (!res.ok) {
        throw new Error(`Groq API error: ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      const parsed = safeParse(content);

      if (!parsed) throw new Error("Failed to parse AI match response");

      return MatchResultSchema.parse(parsed);
    } catch (err) {
      if (attempt === maxRetries) {
        console.error("matchCandidate failed after all retries:", err);
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  throw new Error("Candidate matching failed: Maximum retries reached.");
}

function buildPrompt(input: MatchInput) {
  const { role, rank, resume, jd, projects } = input;

  // Summarise resume for the prompt (avoid token overflow)
  const resumeSummary = {
    name: resume?.name,
    skills: resume?.skills ?? [],
    experience: resume?.experience ?? [],
    education: resume?.education ?? [],
    certifications: resume?.certifications?.map((c: any) => c.name) ?? [],
    yearsOfExperience: resume?.yearsOfExperience,
    summary: resume?.summary,
  };

  // Summarise projects with their IDs
  const projectSummaries = projects.map((p) => ({
    id: p.id,
    name: p.summary.name,
    description: p.summary.description,
    techStack: p.summary.techStack,
    complexity: p.summary.complexity,
    roleRelevance: p.summary.roleRelevance,
    keyFeatures: p.summary.keyFeatures,
  }));

  return `You are evaluating a developer candidate for a job.

## CANDIDATE PROFILE
- Desired Role: ${role}
- Target Rank: ${rank}
- Resume:
${JSON.stringify(resumeSummary, null, 2)}

## JOB DESCRIPTION
- Job Role: ${jd?.role ?? "Not specified"}
- Experience Level Required: ${jd?.experienceLevel ?? "Not specified"}
- Tech Stack Required: ${JSON.stringify(jd?.techStack ?? [])}
- Key Requirements: ${JSON.stringify(jd?.keyRequirements ?? [])}
- Key Signals: ${JSON.stringify(jd?.keySignals ?? [])}

## CANDIDATE PROJECTS (from GitHub, already processed)
${JSON.stringify(projectSummaries, null, 2)}

## YOUR TASK

1. Evaluate how well the candidate fits the job based on:
   - Tech stack overlap between resume + projects vs. JD requirements
   - Candidate's desired role and rank vs. JD's role and experience level
   - Depth and complexity of their projects relative to the seniority level required
   - Certifications, education, and years of experience

2. Select exactly 2 to 3 of the candidate's projects (by their id field) that best demonstrate skills relevant to THIS specific job. Prioritise projects with high roleRelevance for the target role and matching tech stack.

3. Return ONLY valid JSON in this exact schema:
{
  "matchPercentage": <0-100 integer>,
  "selectedProjectIds": ["<id1>", "<id2>", "<id3>"],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "gaps": ["<gap1>", "<gap2>"],
  "reasoning": "<2-4 sentence paragraph explaining the overall match score and why those projects were selected>"
}

Be honest and precise. Do not inflate the match percentage.`;
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
