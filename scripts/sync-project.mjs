import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync('project.config.json', 'utf8'));

function writeJson(path, updater) {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  updater(data);
  fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

writeJson('package.json', data => {
  data.name = config.packageName;
  data.version = config.version;
});

writeJson('src-tauri/tauri.conf.json', data => {
  data.productName = config.productName;
  data.version = config.version;
  data.identifier = config.identifier;

  if (data.app?.windows?.[0]) {
    data.app.windows[0].title = config.productName;
  }
});

let cargoToml = fs.readFileSync('src-tauri/Cargo.toml', 'utf8');
cargoToml = cargoToml.replace(/^name = ".*"$/m, `name = "${config.packageName}"`);
cargoToml = cargoToml.replace(/^version = ".*"$/m, `version = "${config.version}"`);
fs.writeFileSync('src-tauri/Cargo.toml', cargoToml);

let readme = fs.readFileSync('README.md', 'utf8');
readme = readme.replace(/<h1 align="center">.*<\/h1>/, `<h1 align="center">${config.name}</h1>`);
readme = readme.replaceAll(
  /https:\/\/github\.com\/[^/"\s<>]+\/[^)"\s<>]+/g,
  config.github.url,
);
readme = readme.replaceAll(
  /github\/stars\/[^?")]+/g,
  `github/stars/${config.github.owner}/${config.github.repo}`,
);
readme = readme.replaceAll(
  /repos=[^&")]+/g,
  `repos=${config.github.owner}/${config.github.repo}`,
);
fs.writeFileSync('README.md', readme);
