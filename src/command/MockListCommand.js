/**
 * Created by jgaerke on 3/12/18.
 */
class MockListCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mocks [mock] [version]')
      .description('Get mock state')
      .action((mock, version) => {
        this.mockService.getMockState(mock, version).then((state) => {
          this.loggingService.info(state)
        }).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}


module.exports = MockListCommand



