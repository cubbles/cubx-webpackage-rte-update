#! /usr/bin/env node
'use strict';
var RteUpdater = require('../lib/cubx-webpackage-rte-update');
var commandLineArgs = require('command-line-args');

var optionDefinitions = [
  { name: 'webpackagePath', type: String, alias: 'p' },
  { name: 'newRteVersion', type: String, alias: 'V' }
];

var options = commandLineArgs(optionDefinitions);

if (!options.webpackagePath) {
  console.error('Missed necessary parameter "webpackagePath". Usage: cubx-webpackage-rte-update -p <webpackagPath>');
  process.exit(0);
}

if (!options.newRteVersion) {
  console.error('Missed necessary parameter "newRteVersion". Usage: cubx-webpackage-rte-update -v <newRteVersion>');
  process.exit(0);
}

var rteUpdater = new RteUpdater(options.webpackagePath);
rteUpdater.updateRteInWebpackage(options.newRteVersion);
