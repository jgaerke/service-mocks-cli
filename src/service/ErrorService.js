class ErrorService {
  constructor (console, fs, process, loggingService) {
    this.console = console
    this.fs = fs
    this.process = process
    this.loggingService = loggingService
  }

  handle (err, exitCode) {
    if (err) {
      const {message = 'Unexpected error'} = err
      this.loggingService.error(message)
      this.loggingService.debug(err)
    }
    const logPath = this.loggingService.getLogPath()

    this.loggingService.info('For more information specify -debug or see:', logPath)
    this.fs.writeFileSync(logPath, this.loggingService.getDebugMessages().join('\n') + '\n')

    this.process.exit(exitCode || 1)
  }
}

module.exports = ErrorService