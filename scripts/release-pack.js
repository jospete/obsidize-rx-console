#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const { version } = require('../package.json');

const run = (distDirectory, outputDirectory) => {

    const packFile = execSync(`npm pack`, { cwd: distDirectory }).toString();
    console.log(`pack file = ${packFile}`);

    const outputFile = packFile.replace(`-${version}`, '');
    const srcPath = path.join(distDirectory, packFile).trim();
    const destPath = path.join(outputDirectory, outputFile).trim();

    console.log(`copy "${srcPath}" -> "${destPath}"`);
    fs.copySync(srcPath, destPath);
};

run('./dist', './packed');