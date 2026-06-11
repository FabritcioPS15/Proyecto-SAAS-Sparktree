const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'apps/backend/src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(srcDir);

const map = {
  '/config/': '/core/config/',
  '/middleware/': '/core/middleware/',
  '/utils/logger': '/core/logger',
  '/utils/': '/shared/utils/',
  '/helpers/': '/shared/helpers/',
  '/types/': '/shared/types/',
  '/constants/': '/shared/constants/'
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We are looking for lines like: import ... from '../middleware/auth'
  // Or: import ... from './utils/logger'
  // We can use a regex that matches `from '.*'` or `from ".*"`
  content = content.replace(/from\s+['"]([^'"]+)['"]/g, (match, importPath) => {
    // Modify the import path if it matches our mappings
    // importPath is something like '../utils/logger'
    for (const [oldStr, newStr] of Object.entries(map)) {
      if (importPath.includes(oldStr)) {
        // Replace the first occurrence of oldStr in the importPath
        const newPath = importPath.replace(oldStr, newStr);
        return `from '${newPath}'`;
      }
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated imports in: ${file}`);
  }
});
