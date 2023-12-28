import fs from 'fs';
import path from 'path';

// Get the directory name using import.meta
const currentDir = path.dirname(new URL(import.meta.url).pathname);

// Read the original package.json's path
const originalPackagePath = path.resolve(currentDir, 'package.json');

// Read the path of package.json in the build directory
const buildPackagePath = path.resolve(currentDir, 'build', 'package.json');

// Read the content of the original package.json
const originalPackageContent = JSON.parse(
  fs.readFileSync(originalPackagePath, 'utf-8'),
);

// Modify the type property to commonjs
originalPackageContent.type = 'commonjs';

// Write the modified content to the package.json in the build directory
fs.writeFileSync(
  buildPackagePath,
  JSON.stringify(originalPackageContent, null, 2),
);

console.log('package.json updated successfully!');
