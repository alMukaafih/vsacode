#!/usr/bin/env node
const fs = require("node:fs");
if (fs.existsSync("dist"))
    fs.rmSync("dist", { recursive: true });
if (fs.existsSync("js-doc"))
    fs.rmSync("js-doc", { recursive: true });