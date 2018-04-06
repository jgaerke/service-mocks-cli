class MockContractUploadCommand {
  constructor (mockService, loggingService, errorService) {
    this.mockService = mockService
    this.loggingService = loggingService
    this.errorService = errorService
  }

  register (program) {
    program
      .command('mock:contract:upload <file>')
      .option('-n, --name <value>', 'Name if contract provided name is not sufficient')
      .option('-cv, --contract-version <value>', 'Version if contract provided version is not sufficient')
      .option('-u, --url <value>', 'Url to view contract')
      .description('Upload mock contract')
      .action((file, options) => {
        const {name, url, version} = options
        this.mockService.uploadMockContract(file, name, version, url)
          .then(() => {
            this.loggingService.success('Successfully uploaded contract!')
          })
          .catch((err) => {
            this.errorService.handle(err)
          })
      })
  }
}

module.exports = MockContractUploadCommand



