import { z } from "zod";

export const ProjectSummarySchema = z.object({
  name: z.string().transform((val) => val.replace(/-/g, " ").toUpperCase()),
  description: z.string().min(10),
  techStack: z.array(z.string()),
  keyFeatures: z.array(z.string()),
  challenges: z.array(z.string()).default([]), // ← better than optional
  impact: z.string(),
  complexity: z.enum(["low", "medium", "high"]),
  roleRelevance: z.object({
    frontend: z.number().min(0).max(10),
    backend: z.number().min(0).max(10),
    fullstack: z.number().min(0).max(10),
    devops: z.number().min(0).max(10),
  }),
  // embedding: z.array(z.number()).optional(), // if you use it
});

export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;

export type llmContext = {
  packageJson: string | null;
  keyFiles: { path: string; content: string }[];
};
