class MockContractCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mock:contract [name] [version]')
      .description('View mock contract')
      .action((mock, version) => {
        this.mockService.manageMockContract(mock, version).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}

module.exports = MockContractCommand



