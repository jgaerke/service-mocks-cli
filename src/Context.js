const fs = require('fs')
const util = require('util')
const inquirer = require('inquirer')
const program = require('commander')
const updateNotifier = require('update-notifier')
const axios = require('axios')
const opn = require('opn')
const packageJson = require('../package.json')

const DEBUG_MESSAGES = []
const DEBUG_MODE = process.argv.indexOf('--debug') >= 0

const ConfigurationService = require('./service/ConfigurationService')
const LoggingService = require('./service/LoggingService')
const ErrorService = require('./service/ErrorService')
const ProgressService = require('./service/ProgressService')
const MockApi = require('./service/MockApi')
const BrowserService = require('./service/BrowserService')
const MockService = require('./service/MockService')

const ConfigCommand = require('./command/ConfigCommand')
const MockListCommand = require('./command/MockListCommand')
const MockInstanceAddCommand = require('./command/MockInstanceAddCommand')
const MockInstanceRemoveCommand = require('./command/MockInstanceRemoveCommand')
const MockStateGetCommand = require('./command/MockStateGetCommand')
const MockManageCommand = require('./command/MockManageCommand')
const MockContractCommand = require('./command/MockContractCommand')
const MockStateSetCommand = require('./command/MockStateSetCommand')

const singletons = {}

class Context {

  static getConfigurationService () {
    return asSingleton('ConfigurationService', new ConfigurationService(fs, JSON))
  }

  static getLoggingService () {
    return asSingleton('LoggingService', new LoggingService(console, util, JSON, DEBUG_MESSAGES, DEBUG_MODE))
  }

  static getErrorService () {
    return asSingleton('ErrorService', new ErrorService(console, fs, process, Context.getLoggingService()))
  }

  static getProgressService () {
    return asSingleton('ProgressService', new ProgressService(process.stdout, console, setInterval, clearInterval))
  }

  static getMockApi () {
    return asSingleton('MockApi', new MockApi(axios, Context.getProgressService(), Context.getConfigurationService()))
  }

  static getBrowserService () {
    return asSingleton('BrowserService', new BrowserService(opn))
  }

  static getMockService () {
    return asSingleton('MockService', new MockService(Context.getMockApi(), Context.getConfigurationService(), Context.getBrowserService(), inquirer))
  }

  static getConfigCommand () {
    return asSingleton('ConfigureCommand', new ConfigCommand(Context.getConfigurationService(), Context.getLoggingService()))
  }

  static getMockListCommand () {
    return asSingleton('MockListCommand', new MockListCommand(Context.getMockService(), Context.getLoggingService(), Context.getErrorService()))
  }

  static getMockInstanceAddCommand () {
    return asSingleton('MockInstanceAddCommand', new MockInstanceAddCommand(Context.getMockService(), Context.getLoggingService(), Context.getErrorService()))
  }

  static getMockInstanceRemoveCommand () {
    return asSingleton('MockInstanceRemoveCommand', new MockInstanceRemoveCommand(Context.getMockService(), Context.getLoggingService(), Context.getErrorService()))
  }

  static getMockManageCommand () {
    return asSingleton('MockManageCommand', new MockManageCommand(Context.getMockService(), Context.getLoggingService(), Context.getErrorService()))
  }

  static getMockContractCommand () {
    return asSingleton('MockContractCommand', new MockContractCommand(Context.getMockService(), Context.getLoggingService(), Context.getErrorService()))
  }

  static getMockStateGetCommand () {
    return asSingleton('MockStateGetCommand', new MockStateGetCommand(Context.getMockService(), Context.getLoggingService(), Context.getErrorService()))
  }

  static getMockStateSetCommand () {
    return asSingleton('MockStateSetCommand', new MockStateSetCommand(Context.getMockService(), Context.getLoggingService(), Context.getErrorService()))
  }

  static initialize () {
    const notifier = updateNotifier({
      pkg: packageJson
    })
    notifier.notify()
    program
      .version(packageJson.version)
      .usage('<command> [options]')
      .option('-d, --debug', 'show debug info')
    Context.getConfigCommand().register(program)
    Context.getMockListCommand().register(program)
    Context.getMockManageCommand().register(program)
    Context.getMockContractCommand().register(program)
    Context.getMockInstanceAddCommand().register(program)
    Context.getMockInstanceRemoveCommand().register(program)
    Context.getMockStateGetCommand().register(program)
    Context.getMockStateSetCommand().register(program)
    program.parse(process.argv)
    if (!process.argv.slice(2).length) {
      program.help()
    }
  }
}

const asSingleton = (key, instance) => {
  if (!singletons[key]) {
    singletons[key] = instance
  }
  return singletons[key]
}

module.exports = Context