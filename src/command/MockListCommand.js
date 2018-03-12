class MockListCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mock:list')
      .description('List mocks')
      .action(() => {
        this.mockService.getMockList().then((mockList) => {
          this.loggingService.info(mockList)
        }).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}


module.exports = MockListCommand



