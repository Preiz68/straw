import { z } from "zod";

export const ParsedJDSchema = z.object({
  role: z.string().min(1),
  company: z.string().default("Not specified"),
  location: z.string().default("Not specified"),
  type: z
    .enum(["Full-time", "Contract", "Remote", "Hybrid", "On-site"])
    .default("Remote"),
  experienceLevel: z
    .enum(["Junior", "Mid", "Senior", "Staff", "Principal", "Internship"])
    .default("Mid"),
  description: z.string().min(20),
  keyRequirements: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  niceToHave: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  salaryRange: z.string().nullable().default(null),
  keySignals: z.array(z.string()).default([]),
});
