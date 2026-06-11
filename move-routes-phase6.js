const fs = require('fs');
const path = require('path');

const src = path.join(process.cwd(), 'apps/backend/src');
const modules = path.join(src, 'modules');

function createModule(name, routeFiles) {
  const dir = path.join(modules, name);
  fs.mkdirSync(dir, { recursive: true });
  for (const file of routeFiles) {
    const srcFile = path.join(src, 'routes', `${file}.ts`);
    const destFile = path.join(dir, `${file}.routes.ts`);
    if (fs.existsSync(srcFile)) {
      fs.renameSync(srcFile, destFile);
    }
  }
}

// 1. Create modules and move routes
createModule('chat', ['inbox', 'conversations', 'internalNotes', 'assignment']);
createModule('integrations', ['platform', 'whatsappConnections', 'multiWhatsApp', 'whatsappQR', 'qr']);
createModule('analytics', ['analytics']);
createModule('leads', ['leads']);
createModule('settings', ['settings']);
createModule('admin', ['admin']);
createModule('system', ['debug', 'webhooks']); // system / webhooks

// 2. Update imports in api.ts and api/[...routes].ts
function replaceInFile(file, replacer) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let newContent = replacer(content);
  if (content !== newContent) fs.writeFileSync(file, newContent);
}

const apiFiles = [
  path.join(src, 'api.ts'),
  path.join(process.cwd(), 'apps/backend/api/[...routes].ts')
];

for (const apiFile of apiFiles) {
  replaceInFile(apiFile, content => {
    let c = content;
    // Chat
    c = c.replace(/routes\/inbox/g, 'modules/chat/inbox.routes');
    c = c.replace(/routes\/conversations/g, 'modules/chat/conversations.routes');
    c = c.replace(/routes\/internalNotes/g, 'modules/chat/internalNotes.routes');
    c = c.replace(/routes\/assignment/g, 'modules/chat/assignment.routes');
    // Integrations
    c = c.replace(/routes\/platform/g, 'modules/integrations/platform.routes');
    c = c.replace(/routes\/whatsappConnections/g, 'modules/integrations/whatsappConnections.routes');
    c = c.replace(/routes\/multiWhatsApp/g, 'modules/integrations/multiWhatsApp.routes');
    c = c.replace(/routes\/whatsappQR/g, 'modules/integrations/whatsappQR.routes');
    c = c.replace(/routes\/qr/g, 'modules/integrations/qr.routes');
    // Others
    c = c.replace(/routes\/analytics/g, 'modules/analytics/analytics.routes');
    c = c.replace(/routes\/leads/g, 'modules/leads/leads.routes');
    c = c.replace(/routes\/settings/g, 'modules/settings/settings.routes');
    c = c.replace(/routes\/admin/g, 'modules/admin/admin.routes');
    c = c.replace(/routes\/debug/g, 'modules/system/debug.routes');
    c = c.replace(/routes\/webhooks/g, 'modules/system/webhooks.routes');
    return c;
  });
}

// 3. Update internal imports inside the moved route files
// Since they moved from `src/routes/` (depth 2) to `src/modules/<name>/` (depth 3),
// all `../` must become `../../`.

function fixImportsInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImportsInDir(fullPath);
    } else if (file.endsWith('.ts')) {
      replaceInFile(fullPath, content => {
        return content.replace(/from '\.\.\//g, "from '../../");
      });
    }
  }
}

// Fix imports in all new module folders we just created
const newModules = ['chat', 'integrations', 'analytics', 'leads', 'settings', 'admin', 'system'];
for (const m of newModules) {
  fixImportsInDir(path.join(modules, m));
}

console.log('Moved all remaining routes into modules.');
