import { adminDb } from "@/lib/firebase/admin";
import { ProjectSummary } from "@/types/project";

export async function saveProjectSummary(
  repoId: string,
  summary: ProjectSummary,
  userId: string,
) {
  await adminDb.collection("projectSummaries").doc(`${userId}_${repoId}`).set({
    repoId,
    userId,
    summary,
    createdAt: new Date(),
  });
}
