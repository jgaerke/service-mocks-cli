class MockStateSetCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mock:state:set [mock] [version] [resource] [instance] [state]')
      .description('Set mock state')
      .action((mock, version, resource, instance, state) => {
        this.mockService.setMockState(mock, version, resource, instance, state).then(() => {
          this.loggingService.success('Successfully updated mock state!')
        }).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}

module.exports = MockStateSetCommand



