import { getPackageJson, getKeyFiles } from "./filters";
import { llmContext } from "@/types/project";

export function buildContext(data: any): llmContext {
  return {
    packageJson: getPackageJson(data),
    keyFiles: getKeyFiles(data),
  };
}
