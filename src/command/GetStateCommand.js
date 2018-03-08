class SetStateCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('get-state [mock]')
      .description('Get mock state')
      .action((mock) => {
        this.mockService.getMockState(mock).then((state) => {
          this.loggingService.info(state)
        }).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}


module.exports = SetStateCommand



