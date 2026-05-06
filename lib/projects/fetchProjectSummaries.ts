import { adminDb } from "@/lib/firebase/admin";
import { ProjectSummary, ProjectSummarySchema } from "@/types/project";

export type StoredProject = {
  id: string;
  repoId: string;
  summary: ProjectSummary;
  createdAt: FirebaseFirestore.Timestamp;
};

export async function fetchProjectSummaries(
  username: string,
): Promise<StoredProject[]> {
  const snapshot = await adminDb
    .collection("projectSummaries")
    .where("repoId", ">=", username.toLowerCase())
    .get();

  // Fallback: fetch all if username filter returns nothing (no userId scoping yet)
  const allSnapshot =
    snapshot.empty
      ? await adminDb.collection("projectSummaries").limit(20).get()
      : snapshot;

  return allSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      summary: ProjectSummarySchema.parse(data.summary),
    } as StoredProject;
  });
}

export async function fetchAllProjectSummaries(): Promise<StoredProject[]> {
  const snapshot = await adminDb
    .collection("projectSummaries")
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
