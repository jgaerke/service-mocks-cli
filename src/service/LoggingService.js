const colors = require('colors')
colors.mode = process.stdout.isTTY ? colors.mode : 'none'
const WorkDirUtl = require('../util/WorkDirUtil')

class LoggingService {
  constructor (console, util, json, debugMessages, isDebug) {
    this.console = console
    this.util = util
    this.json = json
    this.debugMessages = debugMessages
    this.isDebug = isDebug
    this.logPath = WorkDirUtl.ensureAndGet() + 'svcmocks.log'
  }

  debug (log) {
    log = this.json.stringify(log, null, 2)
    this.debugMessages.push(log)
    if (this.isDebug) {
      this.console.log('--debug-- '.cyan, log)
    }
  }

  info () {
    const msg = this.util.format.apply(this, arguments)
    this.console.log(msg)
  }


  success () {
    const msg = this.util.format.apply(this, arguments)
    this.console.log('SUCCESS:'.green, msg.green)
  }

  error () {
    const msg = this.util.format.apply(this, arguments)
    this.console.log('ERROR:'.red, msg.red)
  }

  getDebugMessages () {
    return this.debugMessages
  }

  getLogPath () {
    return this.logPath
  }
}

module.exports = LoggingService
