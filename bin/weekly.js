#!/usr/bin/env node
'use strict';
const program = require('commander')
const pkg = require('../package.json')
const lib = require('./lib')

program
  .version(pkg.version, '-v, --version', 'output the current version')

let args = JSON.parse(JSON.stringify(process.argv))
if (args.length < 3) {
  lib.help()
  return
}
args.shift()
args.shift()

let commandName = args.shift()
program
  .command(commandName)
  .action(() => {
    try {
      lib[commandName](args)
    } catch (err) {
      console.log(`command ${commandName} does not exist`)
    }
  })

program.parse(process.argv)
