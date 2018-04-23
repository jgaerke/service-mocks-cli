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
      .option('-s, --skip <value>', 'Zero based index position to start with')
      .option('-l, --limit <value>', 'Number of results to limit to')
      .action((options) => {
        const {
          skip = '0',
          limit = '25'
        } = options
        this.mockService.getMockList(skip, limit).then((mockList) => {
          this.loggingService.info(mockList)
        }).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}


module.exports = MockListCommand



