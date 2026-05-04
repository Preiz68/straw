export function getPackageJson(data: any) {
  // We will now pass packageJson directly from ingestRepo
  if (!data.packageJson) return null;

  return truncate(data.packageJson, 2000);
}

export function getKeyFiles(data: any): { path: string; content: string }[] {
  const importantDirs = ["app/", "src/", "pages/", "lib/", "api/"];

  return (data.files || [])
    .filter((f: { path: string; content: string }) =>
      importantDirs.some((dir) => f.path.includes(dir)),
    )
    .map((f: { path: string; content: string }) => ({
      path: f.path,
      content: truncate(f.content, 2000), // Truncate to avoid exceeding database limits
    }))
    .slice(0, 20);
}

function truncate(text: string, max: number) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) : text;
}
