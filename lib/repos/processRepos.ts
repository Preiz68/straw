export async function processRepos(selectedRepos: any[]) {
  return fetch("/api/process", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ selectedRepos }),
  });
}
