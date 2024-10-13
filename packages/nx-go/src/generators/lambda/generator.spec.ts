const normalizeOptions = {
  name: 'my-lambda',
  moduleName: 'mylambda',
  projectRoot: 'apps/my-lambda',
  projectType: 'application',
  parsedTags: ['lambda', 'backend'],
};

import type { Tree } from '@nx/devkit';
import * as nxDevkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { join } from 'path';
import * as shared from '../../utils';
import lambdaGenerator, { defaultTargets } from './generator';
import type { LambdaGeneratorSchema } from './schema';

jest.mock('@nx/devkit');
jest.mock('../../utils', () => ({
  addGoWorkDependency: jest.fn(),
  createGoMod: jest.fn(),
  isGoWorkspace: jest.fn().mockReturnValue(false),
  normalizeOptions: jest.fn().mockReturnValue(normalizeOptions),
}));

describe('lambda generator', () => {
  let tree: Tree;
  const options: LambdaGeneratorSchema = { name: 'test' };

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.clearAllMocks());

  it('should write project configuration', async () => {
    await lambdaGenerator(tree, options);
    expect(nxDevkit.addProjectConfiguration).toHaveBeenCalledWith(
      tree,
      'test',
      {
        root: 'apps/my-lambda',
        projectType: 'application',
        sourceRoot: 'apps/my-lambda',
        targets: defaultTargets,
        tags: ['lambda', 'backend'],
      }
    );
    expect(nxDevkit.updateProjectConfiguration).not.toHaveBeenCalled();
  });

  it('should generate common files', async () => {
    await lambdaGenerator(tree, options);
    expect(nxDevkit.generateFiles).toHaveBeenCalledWith(
      tree,
      join(__dirname, './files/common'),
      'apps/my-lambda',
      normalizeOptions
    );
  });

  it('should generate package file for nx', async () => {
    await lambdaGenerator(tree, options);
    expect(nxDevkit.generateFiles).toHaveBeenCalledWith(
      tree,
      join(__dirname, './files/nx'),
      'apps/my-lambda',
      normalizeOptions
    );
  });

  it('should create Go mod for project if in a Go workspace', async () => {
    jest.spyOn(shared, 'isGoWorkspace').mockReturnValueOnce(true);
    await lambdaGenerator(tree, options);
    expect(shared.createGoMod).toHaveBeenCalledWith(
      tree,
      'apps/my-lambda',
      'apps/my-lambda'
    );
  });

  it('should add tidy executor for project if in a Go workspace', async () => {
    jest.spyOn(shared, 'isGoWorkspace').mockReturnValueOnce(true);
    await lambdaGenerator(tree, options);
    expect(nxDevkit.updateProjectConfiguration).toHaveBeenCalledWith(
      tree,
      'test',
      {
        root: 'apps/my-lambda',
        projectType: 'application',
        sourceRoot: 'apps/my-lambda',
        targets: {
          ...defaultTargets,
          tidy: {
            executor: '@nx-go/nx-go:tidy',
          },
        },
        tags: ['lambda', 'backend'],
      }
    );
  });

  it('should not create Go mod for project if not in a Go workspace', async () => {
    await lambdaGenerator(tree, options);
    expect(shared.createGoMod).not.toHaveBeenCalled();
  });

  it('should add Go work dependency if in a Go workspace', async () => {
    jest.spyOn(shared, 'isGoWorkspace').mockReturnValueOnce(true);
    await lambdaGenerator(tree, options);
    expect(shared.addGoWorkDependency).toHaveBeenCalledWith(
      tree,
      'apps/my-lambda'
    );
  });

  it('should not add Go work dependency if not in a Go workspace', async () => {
    await lambdaGenerator(tree, options);
    expect(shared.addGoWorkDependency).not.toHaveBeenCalled();
  });

  it('should format files', async () => {
    await lambdaGenerator(tree, options);
    expect(nxDevkit.formatFiles).toHaveBeenCalledWith(tree);
  });

  it('should not format files if skipped', async () => {
    await lambdaGenerator(tree, { ...options, skipFormat: true });
    expect(nxDevkit.formatFiles).not.toHaveBeenCalled();
  });
});
