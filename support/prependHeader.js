const glob = require('glob');
const prependFile = require('prepend-file');
const hdr = require('./header');

const distFiles = glob.sync('dist/*.{mjs,js}');
distFiles.forEach(file => {
  prependFile(file, hdr.text);
});
