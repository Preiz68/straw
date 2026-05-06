import { z } from "zod";

export const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "DevOps Engineer",
  "Mobile Developer",
  "UI/UX Engineer",
  "Data Engineer",
] as const;

export const RANKS = [
  "Intern",
  "Entry-Level",
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead",
  "Principal",
  "Staff",
] as const;

export const CandidateProfileSchema = z.object({
  githubUsername: z.string().min(1),
  role: z.enum(ROLES),
  rank: z.enum(RANKS),
  resume: z.any(), // ParsedResume
  jd: z.any(),    // ParsedJD
});

export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

export const MatchResultSchema = z.object({
  matchPercentage: z.number().min(0).max(100),
  selectedProjectIds: z.array(z.string()).min(2).max(3),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  reasoning: z.string(),
});

export type MatchResult = z.infer<typeof MatchResultSchema>;
