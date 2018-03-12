class MockManageContractCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mock:manage:contract [name] [version]')
      .description('Manage mock in console')
      .action((mock, version) => {
        this.mockService.manageMockContract(mock, version).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}

module.exports = MockManageContractCommand



