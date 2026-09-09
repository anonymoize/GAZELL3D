#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const outputPath = path.join(rootDir, 'GAZELL3D.user.js');

const sourceFiles = fs
  .readdirSync(srcDir)
  .filter((file) => /^\d{2}-.*\.js$/.test(file))
  .sort();

const metaFile = '00-userscript-meta.js';
if (!sourceFiles.includes(metaFile)) {
  throw new Error(`Missing required source file: src/${metaFile}`);
}

const readSource = (file) => fs.readFileSync(path.join(srcDir, file), 'utf8').trimEnd();

const metadata = readSource(metaFile);
const bodyFiles = sourceFiles.filter((file) => file !== metaFile);
const extraBlankGapAfter = new Set([
  '08-content-parsers.js',
]);

let body = '';
bodyFiles.forEach((file, index) => {
  body += readSource(file);
  if (index < bodyFiles.length - 1) {
    body += extraBlankGapAfter.has(file) ? '\n\n\n' : '\n\n';
  }
});

const catalog = JSON.parse(fs.readFileSync(path.join(rootDir, 'config.json'), 'utf8'));

const generated = [
  metadata,
  '',
  '(function () {',
  "  'use strict';",
  '',
  `  const NAMING_CATALOG = ${JSON.stringify(catalog)};`,
  '',
  body,
  '})();',
  '',
].join('\n');

fs.writeFileSync(outputPath, generated);
console.log(`Built ${path.relative(rootDir, outputPath)} from ${sourceFiles.length} source files.`);
