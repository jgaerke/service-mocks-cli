class ManageCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('manage')
      .description('List and manage your mocks')
      .action(() => {
        this.mockService.manageMock()
      })
  }
}

module.exports = ManageCommand



