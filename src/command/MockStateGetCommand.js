class MockStateGetCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mock:state:get [mock] [version] [instance]')
      .description('Display mock state')
      .action((mock, version, instance) => {
        this.mockService.getMockState(mock, version, instance).then((state) => {
          this.loggingService.info(state)
        }).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}


module.exports = MockStateGetCommand



