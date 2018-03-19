class MockStateGetCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mock:state:get [mock] [version] [resource] [instance]')
      .description('Display mock state')
      .action((mock, version, resource, instance) => {
        this.mockService.getMockState(mock, version, resource, instance).then((state) => {
          this.loggingService.info(state)
        }).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}


module.exports = MockStateGetCommand



