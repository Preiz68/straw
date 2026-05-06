import { ProjectSummary, ProjectSummarySchema } from "@/types/project";

type GenerateSummaryInput = {
  name: string;
  llmContext: {
    packageJson: string | null;
    keyFiles: { path: string; content: string }[];
  };
};

export async function generateProjectSummary(
  input: GenerateSummaryInput,
): Promise<ProjectSummary> {
  const prompt = buildPrompt(input);
  const maxRetries = 4;

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
            model: "llama-3.1-8b-instant", // ← Fast and higher rate limits
            messages: [
              {
                role: "system",
                content:
                  "You are an expert software engineer. Always respond with valid JSON only. Be concise and accurate.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: attempt === 0 ? 0.1 : 0.25,
            max_tokens: 1200,
            response_format: { type: "json_object" },
          }),
        },
      );

      // Handle Rate Limits (Important for 70B model)
      if (res.status === 429) {
        if (attempt === maxRetries) {
          throw new Error("Groq API rate limit exceeded. Please try again later.");
        }
        const errorData = await res.json().catch(() => ({}));
        const waitTime = errorData.error?.message?.match(/in (\d+\.\d+)s/)
          ? parseFloat(errorData.error.message.match(/in (\d+\.\d+)s/)![1]) *
              1000 +
            1000
          : 3000 * (attempt + 1);

        console.log(
          `⏳ Rate limit hit on llama-3.3-70b. Waiting ${Math.round(waitTime / 1000)}s...`,
        );
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Groq API Error [${res.status}]:`, errorText);
        throw new Error(`Groq API error: ${res.status}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();

      console.log("Generated Text:", text?.substring(0, 300) + "..."); // Short debug

      const parsed = safeParse(text);
      if (!parsed) {
        throw new Error("Failed to extract valid JSON from Groq");
      }

      return ProjectSummarySchema.parse(parsed);
    } catch (error: any) {
      if (attempt === maxRetries) {
        console.error(
          "Project summary generation failed after retries:",
          error,
        );
        throw error;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  throw new Error("Project summary generation failed: Maximum retries reached.");
}

// Keep your existing safeParse and buildPrompt functions
function safeParse(text: string | null | undefined): any {
  if (!text?.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/(\{[\s\S]*\})/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function buildPrompt(input: GenerateSummaryInput) {
  const safeName = input.name.replace(/"/g, '\\"');

  const contextToSend = {
    packageJson: input.llmContext.packageJson,
    keyFiles: input.llmContext.keyFiles.slice(0, 10).map((file) => ({
      path: file.path,
      content:
        file.content.length > 2500
          ? file.content.substring(0, 2500) + "\n...[truncated]"
          : file.content,
    })),
  };

  return `You are a Principal Software Engineer writing honest, technical project summaries for developer portfolios.

Analyze the repository and return **ONLY** valid JSON. No explanations, no markdown, no generic corporate language.

**STRICT SCHEMA**
{
  "name": "${safeName}",
  "description": "string",
  "techStack": ["string"],
  "keyFeatures": ["string"],
  "challenges": ["string"],
  "impact": "string",
  "complexity": "low" | "medium" | "high",
  "roleRelevance": {
    "frontend": number,
    "backend": number,
    "fullstack": number,
    "devops": number
  }
}

**CRITICAL RULES - FOLLOW STRICTLY**

- ONLY use information that can be reasonably inferred from the provided repo context.
- Do NOT add generic claims about "compliance", "regulatory requirements", "industry standards", "scalability", "enterprise-ready", etc. unless clearly visible in the code.
- For dummy/small/personal projects, keep claims realistic and modest.
- Avoid corporate buzzwords completely.

**FIELD GUIDELINES**

- **description**: 3-5 sentences. Be specific about what the project actually does.
- **techStack**: 8-14 actual technologies/libraries visible in the repo (include versions if present).
- **keyFeatures**: 5-8 items. For each feature:
  - Describe what it does.
  - Mention specific technologies used to implement it.
  - Keep it technical and honest.
- **challenges**: Only real technical challenges evident from the code (e.g. state management, API integration, performance, auth, etc.). Use "None clearly identified" if nothing specific is visible.
- **impact**: Honest impact based on what the project does. For personal/dummy projects, focus on learning outcomes or functionality delivered.
- **complexity**: Judge realistically.

**REPOSITORY CONTEXT:**
${JSON.stringify(contextToSend, null, 2)}

Generate the JSON now. Be precise and avoid hallucination.`;
}
