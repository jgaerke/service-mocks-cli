class ConfigCommand {
  constructor (configurationService, loggingService) {
    this.configurationService = configurationService
    this.loggingService = loggingService
  }

  register (program) {
    program
      .command('config')
      .description('Configure api key')
      .option('-l, --list', 'List configuration settings')
      .option('-k, --api-key <value>', 'API key to use')
      .option('-c, --clear [key]', 'Clear config value(s)')
      .action((options) => {
        const {list, apiKey, clear} = options
        if (list) {
          const config = this.configurationService.get()
          const keys = Object.keys(config)
          if (!keys.length) {
            return this.loggingService.error('Config not set')
          }
          keys.forEach((key) => {
            this.loggingService.info(`${key}=${config[key]}`)
          })
          return
        }
        if (apiKey) {
          this.configurationService.set({apiKey})
          this.loggingService.success('Successfully set api key!')
          return
        }
        if (clear) {
          if (clear === true) {
            return this.configurationService.set({})
          }
          const config = this.configurationService.get()
          delete config[clear]
          this.configurationService.set(config)
        }
      })
  }
}

module.exports = ConfigCommand

