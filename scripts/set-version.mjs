import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const version = process.argv[2];

if (!version) {
  console.error('Usage: pnpm version:set <version>');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`Invalid semver: ${version}`);
  process.exit(1);
}

const configPath = 'project.config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
config.version = version;
fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

execFileSync('node', ['scripts/sync-project.mjs'], {
  stdio: 'inherit',
});
