import { logger } from '@nx/devkit';
import * as fs from 'fs';
import * as path from 'path';

export async function copyAssets(assets: string[], outputPath: string) {
    assets.forEach(asset => {
      const assetPath = path.resolve(asset);
      const destination = path.resolve(outputPath, path.basename(asset));
  
      if (fs.existsSync(assetPath))
        fs.cpSync(assetPath, destination, { recursive: true });
    });
  }