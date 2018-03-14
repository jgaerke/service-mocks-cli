class MockManageCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mock:manage [name] [version]')
      .description('Manage mock in console')
      .action((mock, version) => {
        this.mockService.manageMock(mock, version).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}

module.exports = MockManageCommand



