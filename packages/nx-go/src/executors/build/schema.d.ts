export interface BuildExecutorSchema {
  main: string;
  outputPath?: string;
  outputName?: string;
  buildMode?: string;
  env?: { [key: string]: string };
  flags?: string[];
  assets?: string[];
}
