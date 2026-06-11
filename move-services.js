const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.cwd(), 'apps/backend/src');

const moves = [
  // Controllers
  ['controllers/webhookController.ts', 'modules/system/webhookController.ts'],
  // Business Services
  ['services/adminService.ts', 'modules/admin/adminService.ts'],
  ['services/assignmentService.ts', 'modules/chat/assignmentService.ts'],
  ['services/internalNotesService.ts', 'modules/chat/internalNotesService.ts'],
  ['services/multiWhatsAppService.ts', 'modules/integrations/multiWhatsAppService.ts'],
  ['services/whatsappQRService.ts', 'modules/integrations/whatsappQRService.ts'],
  ['services/whatsappService.ts', 'modules/integrations/whatsappService.ts'],
  ['services/sessionPersistenceService.ts', 'modules/integrations/sessionPersistenceService.ts'],
  // Shared Infrastructure Services
  ['services/cacheService.ts', 'shared/services/cacheService.ts'],
  ['services/messageQueueService.ts', 'shared/services/messageQueueService.ts'],
  ['services/queueService.ts', 'shared/services/queueService.ts'],
];

// Special case: Directory
const platformDirSrc = path.join(baseDir, 'services/platform');
const platformDirDest = path.join(baseDir, 'modules/integrations/platform');

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

// 1. Calculate moves
const fileMoves = {}; // oldAbs -> newAbs

for (const [srcRel, destRel] of moves) {
  const oldAbs = path.join(baseDir, srcRel);
  const newAbs = path.join(baseDir, destRel);
  if (fs.existsSync(oldAbs)) {
    fileMoves[oldAbs] = newAbs;
  }
}

if (fs.existsSync(platformDirSrc)) {
  const platformFiles = getTsFiles(platformDirSrc);
  for (const pf of platformFiles) {
    const rel = path.relative(platformDirSrc, pf);
    const newAbs = path.join(platformDirDest, rel);
    fileMoves[pf] = newAbs;
  }
}

// 2. Perform moves
for (const [oldAbs, newAbs] of Object.entries(fileMoves)) {
  fs.mkdirSync(path.dirname(newAbs), { recursive: true });
  fs.renameSync(oldAbs, newAbs);
}

// Ensure the old directories are deleted if empty
function cleanupDir(dir) {
  if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
}
cleanupDir(platformDirSrc);
cleanupDir(path.join(baseDir, 'services'));
cleanupDir(path.join(baseDir, 'controllers'));

// 3. Update imports across all TS files
// We need to look at all TS files in backend (including api/[...routes].ts and worker.ts)
const allTsFiles = [
  ...getTsFiles(baseDir),
  path.join(process.cwd(), 'apps/backend/api/[...routes].ts'),
  path.join(process.cwd(), 'apps/backend/api/webhook.ts'),
  path.join(process.cwd(), 'apps/backend/src/worker.ts'), // worker is in src
];

const oldAbsKeys = Object.keys(fileMoves);

// To resolve old imports, we read each file.
for (const file of allTsFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We look for ES6 import statements and dynamic imports
  // regex to catch `from '../services/something'` or `import('../services/something')`
  const importRegex = /(from\s+['"]|import\s*\(\s*['"])([^'"]+)(['"])/g;
  
  content = content.replace(importRegex, (match, prefix, importPath, suffix) => {
    if (importPath.startsWith('.')) {
      // Resolve the absolute path of what it was pointing to
      // Because we moved the files, the current `file` path is the new path.
      // Wait: If THIS file was also moved, `path.dirname(file)` is the new dir.
      // We need to resolve what the import MEANT in the NEW file location.
      // Actually, if we just blindly change it:
      // A file that moved from A to B, now has imports pointing relative to B.
      // We should have updated internal imports BEFORE moving, or handle it carefully.
      
      // Let's resolve the absolute path it is CURRENTLY pointing to:
      const currentTargetAbs = path.resolve(path.dirname(file), importPath);
      // Wait, if it points to an old service, `currentTargetAbs` won't exist because we moved it!
      // BUT if the import path STILL has the old string (like `../services/adminService`), 
      // resolving it from the NEW directory might point to garbage.
      // Ah! We must resolve it from the OLD directory of this file!
      
      // Find old path of `file`
      const oldFileAbs = Object.keys(fileMoves).find(k => fileMoves[k] === file) || file;
      
      // The absolute target path BEFORE moving was:
      let targetOldAbs = path.resolve(path.dirname(oldFileAbs), importPath);
      // If it doesn't end with .ts, add it
      if (!targetOldAbs.endsWith('.ts')) targetOldAbs += '.ts';
      // Also could be index.ts
      let targetOldAbsIndex = path.resolve(path.dirname(oldFileAbs), importPath, 'index.ts');

      let targetNewAbs = null;

      if (fileMoves[targetOldAbs]) {
        targetNewAbs = fileMoves[targetOldAbs];
      } else if (fileMoves[targetOldAbsIndex]) {
        targetNewAbs = fileMoves[targetOldAbsIndex];
      } else {
        // The target didn't move. But DID THIS FILE move?
        if (oldFileAbs !== file) {
          // Yes, this file moved. We need to update its relative path to the unmoved target.
          // Wait, the target is still at targetOldAbs.
          targetNewAbs = targetOldAbs;
        }
      }

      if (targetNewAbs) {
        // Compute new relative path
        let newRel = path.relative(path.dirname(file), targetNewAbs);
        // remove .ts
        if (newRel.endsWith('.ts')) newRel = newRel.slice(0, -3);
        // ensure starts with .
        if (!newRel.startsWith('.')) newRel = './' + newRel;
        // fix windows slashes
        newRel = newRel.replace(/\\/g, '/');
        
        changed = true;
        return `${prefix}${newRel}${suffix}`;
      }
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content);
  }
}

console.log('Successfully moved services and controllers and rewrote imports.');
