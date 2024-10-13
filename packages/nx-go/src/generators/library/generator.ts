import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
  ProjectConfiguration,
  TargetConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import *  as merge from 'deepmerge'; 
import { join } from 'path';
import {
  addGoWorkDependency,
  createGoMod,
  isGoWorkspace,
  normalizeOptions,
} from '../../utils';
import { LibraryGeneratorSchema } from './schema';
import { getTargetDefaults } from '../../utils/target-defaults';

export const defaultTargets: { [targetName: string]: TargetConfiguration } = {
  test: {
    executor: '@nx-go/nx-go:test',
  },
  lint: {
    executor: '@nx-go/nx-go:lint',
  },
};

export default async function libraryGenerator(
  tree: Tree,
  schema: LibraryGeneratorSchema
) {
  const options = await normalizeOptions(
    tree,
    schema,
    'library',
    '@nx-go/nx-go:library'
  );
  const executor = "@nx-go/nx-go:";

  const mergedTargets = merge(defaultTargets, getTargetDefaults(tree, executor));

  const projectConfiguration: ProjectConfiguration = {
    root: options.projectRoot,
    projectType: options.projectType,
    sourceRoot: options.projectRoot,
    tags: options.parsedTags,
    targets: mergedTargets,
  };

  addProjectConfiguration(tree, options.name, projectConfiguration);

  generateFiles(tree, join(__dirname, 'files/common'), options.projectRoot, {
    ...options,
    ...names(options.projectName),
  });

  if (schema.generatePackageJson) {
    await generateFiles(tree, join(__dirname, 'files/nx'), options.projectRoot, options);
  }

  if (isGoWorkspace(tree)) {
    createGoMod(tree, options.projectRoot, options.projectRoot);
    addGoWorkDependency(tree, options.projectRoot);
    projectConfiguration.targets.tidy = {
      executor: '@nx-go/nx-go:tidy',
    };
    updateProjectConfiguration(tree, options.name, projectConfiguration);
  }

  if (!schema.skipFormat) {
    await formatFiles(tree);
  }
}
