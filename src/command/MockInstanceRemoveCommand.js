class MockInstanceRemoveCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mock:instance:remove [mock] [version] [instance]')
      .description('Remove instance from mock')
      .action((mock, version, instance) => {
        this.mockService.removeMockInstance(mock, version, instance).then(() => {
          this.loggingService.success('Successfully removed mock instance!')
        }).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}

module.exports = MockInstanceRemoveCommand



