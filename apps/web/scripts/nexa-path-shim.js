// Ensures predictable module resolution across the monorepo
const path = require('path');
const Module = require('module');

const here = __dirname;                           // apps/web/scripts
const app   = path.resolve(here, '..');           // apps/web
const root  = path.resolve(app, '..', '..');      // Nexa ERP root
const pkgs  = path.resolve(root, 'packages');     // monorepo packages (if any)
const src   = path.resolve(app, 'src');           // app src

process.env.NODE_PATH = [
  app,
  src,
  pkgs
].join(path.delimiter);

Module._initPaths();
