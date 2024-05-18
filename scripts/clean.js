#!/usr/bin/env node
import * as fs from "node:fs";
if (fs.existsSync(process.argv[2]))
    fs.rmSync(process.argv[2], { recursive: true });