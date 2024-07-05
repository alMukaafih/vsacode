#!/usr/bin/env node
import { execSync } from "child_process";
import { join } from 'path';
import { readFileSync, createWriteStream, readdirSync, statSync, writeFileSync } from 'fs';
import jszip from 'jszip';

// Manipulate plugin.json file
const plugin = {
    id: "almukaafih.vsacode",
    name: "VS Acode",
    main: "main.js",
    version: "",
    readme: "README.md",
    icon: "icon.png",
    files: [],
    minVersionCode: 292,
    author: {
        name: "alMukaafih",
        email: "almukaafih@gmail.com",
        github: "alMukaafih"
    }
}

const packageJson = JSON.parse(readFileSync("../package.json").toString())
if (process.argv.length == 2) {
    plugin.version = `${packageJson.version}-beta`
    plugin.id += ".beta"
    plugin.name += " (Beta)"
}
writeFileSync("plugin.json", JSON.stringify(plugin))

execSync("yarn webpack-cli --mode production", { stdio: 'inherit' })

const iconFile = 'icon.png';
const pluginJson = 'plugin.json';
const distFolder = 'dist';
const appIcon = 'app-icon.svg';
const readmeDotMd = join('README.md');

// create zip file of dist folder

const zip = new jszip();

zip.file('icon.png', readFileSync(iconFile));
zip.file('plugin.json', readFileSync(pluginJson));
zip.file('readme.md', readFileSync(readmeDotMd));
zip.file('app-icon.svg', readFileSync(appIcon));

loadFile('', distFolder);

zip
  .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  .pipe(createWriteStream('vsacode.zip'))
  .on('finish', () => {
    console.log('vsacode.zip written.');
  });

function loadFile(root, folder) {
  const distFiles = readdirSync(folder);
  distFiles.forEach((file) => {

    const stat = statSync(join(folder, file));

    if (stat.isDirectory()) {
      zip.folder(file);
      loadFile(join(root, file), join(folder, file));
      return;
    }

    if (!/LICENSE.txt/.test(file)) {
      zip.file(join(root, file), readFileSync(join(folder, file)));
    }
  });
}