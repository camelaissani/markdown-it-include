#!/usr/bin/env node

/* eslint no-console:0 */



const argparse = require('argparse');
const hdr = require('./header.js');

const cli = new argparse.ArgumentParser({
  prog: 'getGlobalName',
  version: hdr.version,
  addHelp: true
});

cli.addArgument([ 'type' ], {
  help: 'type of name/string to produce',
  nargs: '?',
  choices: [ 'global', 'package', 'version', 'license', 'microbundle' ]
});

const options = cli.parseArgs();

////////////////////////////////////////////////////////////////////////////////

switch (options.type) {
default:
  cli.exit(1, cli.formatHelp());
  break;

case 'version':
  cli.exit(0, hdr.version);
  break;

case 'package':
  cli.exit(0, hdr.packageName);
  break;

case 'global':
  cli.exit(0, hdr.globalName);
  break;

case 'microbundle':
  cli.exit(0, hdr.safeVariableName);
  break;

case 'license':
  cli.exit(0, hdr.license);
  break;
}
