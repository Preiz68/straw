import { adminDb } from "@/lib/firebase/admin";
import { ProjectSummary } from "@/types/project";

export async function saveProjectSummary(
  repoId: string,
  summary: ProjectSummary,
) {
  await adminDb.collection("projectSummaries").doc(repoId).set({
    repoId,
    summary,
    createdAt: new Date(),
  });
}
