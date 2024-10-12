import { readNxJson, TargetConfiguration, Tree } from "@nx/devkit";

export function getTargetDefaults(tree: Tree, executorName: string) {
    const nxJson = readNxJson(tree);
  
    return Object.entries(nxJson.targetDefaults || {})
      .filter(([key]) => key.startsWith(executorName))
      .reduce((acc, [key, value]) => {
        const newKey = key.replace(executorName, '');
        acc[newKey] = value;
        return acc;
      }, {} as { [targetName: string]: TargetConfiguration });
  }