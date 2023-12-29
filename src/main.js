#!/bin/env node
// used packages
const fs = require("fs");
const os = require("os");
const path = require("path");
const AdmZip = require("adm-zip");

// vsix file
let vsix = process.argv[2];

// cleanup task
process.on('exit', (code) => {
    console.log('Exiting Node.js process with code:', code);
    fs.rmSync(tmpDir, { recursive: true });
});

// create temp directory
let tmpDir;
const appPrefix = 'vsc-acode';
tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));

// extract vsix file
const zip = new AdmZip(vsix);
zip.extractAllTo(tmpDir);
