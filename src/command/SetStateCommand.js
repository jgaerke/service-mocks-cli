class SetStateCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('set-state [mock] [resource] [instance] [state]')
      .description('Set mock state')
      .option('-i, --interactive', 'Interactively list mocks, resources, and instances to choose state from')
      .action((mock, resource, instance, state, options) => {
        this.mockService.setMockState(mock, resource, instance, state, options.interactive).then((result) => {
          this.loggingService.success('Successfully updated mock state!')
        }).catch((err) => {
          this.errorService.handle(err)
        })
      })
  }
}

module.exports = SetStateCommand



