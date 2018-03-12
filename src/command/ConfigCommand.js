class ConfigCommand {
  constructor (configurationService, loggingService) {
    this.configurationService = configurationService
    this.loggingService = loggingService
  }

  register (program) {
    program
      .command('config')
      .description('Set configuration options')
      .option('-l, --list', 'List configuration settings')
      .option('-cu, --console-url <value>', 'Console url to use. Default is https://console.servicemocks.com')
      .option('-au, --api-url <value>', 'API url to use. Default is https://api.servicemocks.com')
      .option('-k, --api-key <value>', 'API key to use')
      .option('-c, --clear [key]', 'Clear config value(s)')
      .action((options) => {
        const {list, consoleUrl, apiUrl, apiKey, clear} = options
        if(!list && !consoleUrl && !apiUrl && !apiUrl && !clear) {
          program.help()
        }
        if (list) {
          this.loggingService.info(this.configurationService.list())
          return
        }
        if (consoleUrl) {
          this.configurationService.set({consoleUrl})
          this.loggingService.success('Successfully set console url!')
          return
        }
        if (apiUrl) {
          this.configurationService.set({apiUrl})
          this.loggingService.success('Successfully set api url!')
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

