const fs = require('fs')
const util = require('util')
const inquirer = require('inquirer')
const program = require('commander')
const axios = require('axios')
const opn = require('opn')
const packageJson = require('../package.json')

const API_URL_BASE = 'https://api.servicemocks.com'
const DEBUG_MESSAGES = []
const DEBUG_MODE = process.argv.indexOf('--debug') >= 0
const CONFIG_PATH = process.env.HOME + '/.svcmocks/config.json'
const LOG_PATH = process.env.HOME + '/.svcmocks/.svcmocks-log'


const ConfigurationService = require('./service/ConfigurationService')
const LoggingService = require('./service/LoggingService')
const ErrorService = require('./service/ErrorService')
const ProgressService = require('./service/ProgressService')
const MockApi = require('./service/MockApi')
const BrowserService = require('./service/BrowserService')
const MockService = require('./service/MockService')

const ConfigCommand = require('./command/ConfigCommand')
const GetStateCommand = require('./command/GetStateCommand')
const ManageCommand = require('./command/ManageCommand')
const LoginCommand = require('./command/LoginCommand')
const SetStateCommand = require('./command/SetStateCommand')

const singletons = {}

class Context {

  static getConfigurationService () {
    return asSingleton('ConfigurationService', new ConfigurationService(fs, CONFIG_PATH, JSON))
  }

  static getLoggingService () {
    return asSingleton('LoggingService', new LoggingService(console, util, JSON, DEBUG_MESSAGES, DEBUG_MODE, LOG_PATH))
  }

  static getErrorService () {
    return asSingleton('ErrorService', new ErrorService(console, fs, process, Context.getLoggingService()))
  }

  static getProgressService () {
    return asSingleton('ProgressService', new ProgressService(process.stdout, console, setInterval, clearInterval))
  }

  static getMockApi () {
    return asSingleton('MockApi', new MockApi(axios, API_URL_BASE, Context.getProgressService(), Context.getConfigurationService()))
  }

  static getBrowserService () {
    return asSingleton('BrowserService', new BrowserService(opn))
  }

  static getMockService () {
    return asSingleton('MockService', new MockService(Context.getMockApi(), Context.getBrowserService(), inquirer))
  }

  static getConfigCommand () {
    return asSingleton('ConfigureCommand', new ConfigCommand(Context.getConfigurationService(), Context.getLoggingService()))
  }

  static getLoginCommand () {
    return asSingleton('LoginCommand', new LoginCommand(Context.getBrowserService()))
  }

  static getManageCommand () {
    return asSingleton('ManageCommand', new ManageCommand(Context.getMockService(), Context.getLoggingService(), Context.getErrorService()))
  }

  static getGetStateCommand () {
    return asSingleton('GetStateCommand', new GetStateCommand(Context.getMockService(), Context.getLoggingService(), Context.getErrorService()))
  }

  static getSetStateCommand () {
    return asSingleton('SetStateCommand', new SetStateCommand(Context.getMockService(), Context.getLoggingService(), Context.getErrorService()))
  }

  static initialize () {
    program
      .version(packageJson.version)
      .usage('<command> [options]')
      .option('-d, --debug', 'show debug info')
    Context.getConfigCommand().register(program)
    Context.getManageCommand().register(program)
    Context.getLoginCommand().register(program)
    Context.getGetStateCommand().register(program)
    Context.getSetStateCommand().register(program)
    program.parse(process.argv)
  }
}

const asSingleton = (key, instance) => {
  if (!singletons[key]) {
    singletons[key] = instance
  }
  return singletons[key]
}

module.exports = Context