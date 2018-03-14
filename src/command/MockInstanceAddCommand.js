class MockInstanceAddCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mock:instance:add [mock] [version] [instance]')
      .description('Add instance to mock')
      .action((mock, version, instance) => {
        this.mockService.addMockInstance(mock, version, instance).then(() => {
          this.loggingService.success('Successfully added mock instance!')
        }).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}

module.exports = MockInstanceAddCommand



