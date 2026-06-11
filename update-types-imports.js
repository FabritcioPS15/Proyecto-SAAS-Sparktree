const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.cwd(), 'apps/backend/src');
const apiFiles = [
  path.join(process.cwd(), 'apps/backend/api/[...routes].ts'),
  path.join(process.cwd(), 'apps/backend/api/webhook.ts'),
];

function getTsFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(getTsFiles(full));
    } else if (file.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

const allTsFiles = [...getTsFiles(baseDir), ...apiFiles];

// Look for imports from `../types`, `../../types`, `./types`, `../types/whatsapp`, etc.
for (const file of allTsFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Regex to match imports from the local types folder
  // `from '../types'` or `from '../../types/whatsapp'`
  const importRegex = /(from\s+['"])([^'"]+?)(?:types|types\/whatsapp|types\/index)(['"])/g;
  
  content = content.replace(importRegex, (match, prefix, relativePath, suffix) => {
    // If the path was resolving to the local types folder...
    // just replace the whole path with '@sparktree/types'
    changed = true;
    return `${prefix}@sparktree/types${suffix}`;
  });

  if (changed) {
    fs.writeFileSync(file, content);
  }
}

// Now update tsconfig.json to remove the old types
const tsconfigPath = path.join(process.cwd(), 'apps/backend/tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.types) {
    tsconfig.compilerOptions.types = tsconfig.compilerOptions.types.filter(t => !t.includes('src/types'));
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log('Updated tsconfig.json');
  }
}

// Remove old types folder
const oldTypesDir = path.join(baseDir, 'types');
if (fs.existsSync(oldTypesDir)) {
  fs.rmSync(oldTypesDir, { recursive: true, force: true });
  console.log('Removed old types directory');
}

console.log('Updated imports to use @sparktree/types');
