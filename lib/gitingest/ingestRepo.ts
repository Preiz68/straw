export async function ingestRepo(repoUrl: string) {
  const res = await fetch("https://gitingest.com/api/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      input_text: repoUrl,
      max_file_size: 50000
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`GitIngest API failed: ${res.statusText} - ${errorBody}`);
  }

  const data = await res.json();

  const files: { path: string; content: string }[] = [];
  let packageJson: string | null = null;
  
  if (data && data.content) {
    const blocks = data.content.split(/================================================\r?\nFILE: /);
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const newlineIdx = block.indexOf("\n");
      if (newlineIdx !== -1) {
        const path = block.slice(0, newlineIdx).trim();
        
        const separator = "================================================";
        const separatorIdx = block.indexOf(separator);
        let fileContent = "";
        
        if (separatorIdx !== -1) {
          const contentStartIdx = block.indexOf("\n", separatorIdx + separator.length) + 1;
          fileContent = block.slice(contentStartIdx).trim();
        }
        
        files.push({ path, content: fileContent });
        
        if (path === "package.json" || path.endsWith("/package.json")) {
          packageJson = fileContent;
        }
      }
    }
  }

  return {
    ...data,
    files,
    packageJson
  };
}
