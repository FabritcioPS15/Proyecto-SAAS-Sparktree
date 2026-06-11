const fs = require('fs');
const path = require('path');

function replaceInFile(file, replacements) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(file, content);
}

const base = path.join(process.cwd(), 'apps/backend');

// 1. Fix api/[...routes].ts
replaceInFile(path.join(base, 'api/[...routes].ts'), [
  [/from '\.\.\/src\/routes\/users'/g, "from '../src/modules/users/users.routes'"],
  [/from '\.\.\/src\/routes\/flows'/g, "from '../src/modules/bots/bots.routes'"],
  [/from '\.\.\/src\/routes\/auth'/g, "from '../src/modules/auth/auth.routes'"]
]);

// 2. Fix flows engine imports
replaceInFile(path.join(base, 'src/controllers/webhookController.ts'), [
  [/from '\.\.\/flows'/g, "from '../modules/bots/engine/flow-core'"]
]);
replaceInFile(path.join(base, 'src/routes/debug.ts'), [
  [/from '\.\.\/flows'/g, "from '../modules/bots/engine/flow-core'"]
]);
replaceInFile(path.join(base, 'src/services/multiWhatsAppService.ts'), [
  [/from '\.\.\/flows'/g, "from '../modules/bots/engine/flow-core'"]
]);
replaceInFile(path.join(base, 'src/services/platform/facebookMessengerService.ts'), [
  [/from '\.\.\/\.\.\/flows'/g, "from '../../modules/bots/engine/flow-core'"]
]);
replaceInFile(path.join(base, 'src/services/platform/instagramService.ts'), [
  [/from '\.\.\/\.\.\/flows'/g, "from '../../modules/bots/engine/flow-core'"]
]);
replaceInFile(path.join(base, 'src/services/platform/mercadolibreService.ts'), [
  [/from '\.\.\/\.\.\/flows'/g, "from '../../modules/bots/engine/flow-core'"]
]);
replaceInFile(path.join(base, 'src/services/platform/telegramService.ts'), [
  [/from '\.\.\/\.\.\/flows'/g, "from '../../modules/bots/engine/flow-core'"]
]);
replaceInFile(path.join(base, 'src/services/platform/tiktokService.ts'), [
  [/from '\.\.\/\.\.\/flows'/g, "from '../../modules/bots/engine/flow-core'"]
]);
replaceInFile(path.join(base, 'src/services/whatsappQRService.ts'), [
  [/from '\.\.\/flows'/g, "from '../modules/bots/engine/flow-core'"]
]);
replaceInFile(path.join(base, 'src/worker.ts'), [
  [/from '\.\/flows'/g, "from './modules/bots/engine/flow-core'"]
]);

console.log('Fixed flows and routes imports.');
