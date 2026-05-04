import { adminDb } from "@/lib/firebase/admin";
import { Repo } from "@/types/repo";

export async function saveRepos(userId: string, repos: Repo[]) {
  const batch = adminDb.batch();
  const ref = adminDb.collection("repos");

  for (const repo of repos) {
    const docId = repo.id || repo.name;
    const docRef = ref.doc(docId);

    batch.set(
      docRef,
      {
        userId,
        ...repo,
        selected: false,
      },
      { merge: true },
    );
  }

  await batch.commit();
}
