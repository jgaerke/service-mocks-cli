class LoginCommand {
  constructor (browerService) {
    this.browserService = browerService
  }

  register (program) {
    // program
    //   .command('login')
    //   .description('Login using account credentials')
    //   .action(() => {
    //     this.browserService.open('https://servicemocks.com')
    //   })
  }
}

module.exports = LoginCommand

