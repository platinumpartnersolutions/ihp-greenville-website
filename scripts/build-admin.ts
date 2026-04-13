import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';

const root = path.resolve(process.cwd());
const outDir = path.join(root, 'public', 'admin');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(root, 'client', 'admin', 'editor.ts')],
  bundle: true,
  outfile: path.join(outDir, 'editor.js'),
  format: 'iife',
  platform: 'browser',
  minify: true,
  logLevel: 'info',
});

console.log('✅ Admin editor bundle built → public/admin/editor.js');
