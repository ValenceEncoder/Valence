const fs = require('fs');
const pkg = require('./package.json');

pkg.main = './App.ts';

fs.writeFileSync('./src/package.json', JSON.stringify(pkg, null, 2));