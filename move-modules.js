const fs = require('fs');
const path = require('path');

const src = path.join(process.cwd(), 'apps/backend/src');
const modules = path.join(src, 'modules');

// 1. Setup Auth
fs.mkdirSync(path.join(modules, 'auth'), { recursive: true });
if (fs.existsSync(path.join(src, 'routes/auth.ts'))) {
  fs.renameSync(path.join(src, 'routes/auth.ts'), path.join(modules, 'auth/auth.routes.ts'));
}

// 2. Setup Users
fs.mkdirSync(path.join(modules, 'users'), { recursive: true });
if (fs.existsSync(path.join(src, 'routes/users.ts'))) {
  fs.renameSync(path.join(src, 'routes/users.ts'), path.join(modules, 'users/users.routes.ts'));
}

// 3. Setup Bots
fs.mkdirSync(path.join(modules, 'bots/engine'), { recursive: true });
if (fs.existsSync(path.join(src, 'routes/flows.ts'))) {
  fs.renameSync(path.join(src, 'routes/flows.ts'), path.join(modules, 'bots/bots.routes.ts'));
}
if (fs.existsSync(path.join(src, 'flows'))) {
  fs.renameSync(path.join(src, 'flows'), path.join(modules, 'bots/engine/flow-core'));
}

// Update imports in api.ts
const apiPath = path.join(src, 'api.ts');
if (fs.existsSync(apiPath)) {
  let api = fs.readFileSync(apiPath, 'utf8');
  api = api.replace(/from '\.\/routes\/auth'/g, "from './modules/auth/auth.routes'");
  api = api.replace(/from '\.\/routes\/users'/g, "from './modules/users/users.routes'");
  api = api.replace(/from '\.\/routes\/flows'/g, "from './modules/bots/bots.routes'");
  fs.writeFileSync(apiPath, api);
}

// We also need to update imports INSIDE the moved files
function replaceInFile(file, replacer) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let newContent = replacer(content);
  if (content !== newContent) fs.writeFileSync(file, newContent);
}

// auth.routes.ts was in src/routes/auth.ts (depth 2). Now in src/modules/auth/auth.routes.ts (depth 3).
// Import paths starting with '../' need to become '../../'
replaceInFile(path.join(modules, 'auth/auth.routes.ts'), content => {
  return content.replace(/from '\.\.\//g, "from '../../");
});

// users.routes.ts (depth 3)
replaceInFile(path.join(modules, 'users/users.routes.ts'), content => {
  return content.replace(/from '\.\.\//g, "from '../../");
});

// bots.routes.ts (depth 3)
replaceInFile(path.join(modules, 'bots/bots.routes.ts'), content => {
  let c = content.replace(/from '\.\.\//g, "from '../../");
  // Also fix import for flows engine: was '../flows' now './engine/flow-core'
  c = c.replace(/from '\.\.\/\.\.\/flows/g, "from './engine/flow-core");
  return c;
});

// Now we need to fix imports inside flow-core.
// flow-core was at src/flows (depth 2). Now it's at src/modules/bots/engine/flow-core (depth 4).
// So anything that was `../` (pointing to src/) now needs to be `../../../../`
function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
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

const flowFiles = walk(path.join(modules, 'bots/engine/flow-core'));
flowFiles.forEach(file => {
  replaceInFile(file, content => {
    // Replace `../` with `../../../../`
    // However, wait. If it had `../../` it would become `../../../../../`
    // Let's just do a string replace for known paths
    let c = content;
    // Replace `../core/` with `../../../../core/`
    c = c.replace(/from ['"]\.\.\/core\//g, "from '../../../../core/");
    c = c.replace(/from ['"]\.\.\/shared\//g, "from '../../../../shared/");
    c = c.replace(/from ['"]\.\.\/services\//g, "from '../../../../services/");
    c = c.replace(/from ['"]\.\.\/config\//g, "from '../../../../core/config/"); // legacy
    return c;
  });
});

console.log('Moved auth, users, and bots routes.');
