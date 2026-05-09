import { adminDb } from "@/lib/firebase/admin";
import { ProjectSummary, ProjectSummarySchema } from "@/types/project";

export type StoredProject = {
  id: string;
  repoId: string;
  summary: ProjectSummary;
  createdAt: FirebaseFirestore.Timestamp;
};

export async function fetchProjectSummaries(
  userId: string,
): Promise<StoredProject[]> {
  const snapshot = await adminDb
    .collection("projectSummaries")
    .where("userId", "==", userId)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      summary: ProjectSummarySchema.parse(data.summary),
    } as StoredProject;
  });
}

export async function fetchAllProjectSummaries(userId: string): Promise<StoredProject[]> {
  const snapshot = await adminDb
    .collection("projectSummaries")
    .where("userId", "==", userId)
    .limit(20)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      summary: ProjectSummarySchema.parse(data.summary),
    } as StoredProject;
  });
}
