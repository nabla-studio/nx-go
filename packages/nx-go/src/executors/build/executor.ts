import { ExecutorContext, logger } from '@nx/devkit';
import {
  buildStringFlagIfValid,
  executeCommand,
  extractProjectRoot,
} from '../../utils';
import { BuildExecutorSchema } from './schema';
import { copyAssets } from '../../utils/copy-assets';

/**
 * This executor builds an executable using the `go build` command.
 *
 * @param options options passed to the executor
 * @param context context passed to the executor
 */
export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  await copyAssets(options.assets, options.outputPath);
  
  return executeCommand(buildParams(options, context), {
    cwd: context.cwd,
    env: options.env,
  });
}

const buildParams = (
  options: BuildExecutorSchema,
  context: ExecutorContext
): string[] => {
  const completePath = `${options.outputPath}/${options.outputName || "main"}`;
  return [
    'build',
    '-o',
    buildOutputPath(extractProjectRoot(context), completePath),
    ...buildStringFlagIfValid('-buildmode', options.buildMode),
    ...(options.flags ?? []),
    options.main,
  ];
};

/**
 * Builds the output path of the executable based on the project root.
 *
 * @param projectRoot project root
 * @param customPath custom path to use first
 */
const buildOutputPath = (projectRoot: string, customPath?: string): string => {
  const extension = process.platform === 'win32' ? '.exe' : '';
  return (customPath ?? `dist/${projectRoot}`) + extension;
};
