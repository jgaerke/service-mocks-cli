class MockManageDefinitionCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mock:manage:def [name] [version]')
      .description('Manage mock contract at contract source')
      .action((mock, version) => {
        this.mockService.manageMockDefinition(mock, version).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}

module.exports = MockManageDefinitionCommand



