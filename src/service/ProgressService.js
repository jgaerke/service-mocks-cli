class ProgressService {
  constructor (stdout, console, setInterval, clearInterval) {
    this.stdout = stdout
    this.console = console
    this.setInterval = setInterval
    this.clearInterval = clearInterval
    this.intervalId = null
  }

  start () {
    this.stdout.write('.')
    if (this.stdout.isTTY) {
      this.intervalId = this.intervalId || this.setInterval(() => {
          process.stdout.write('.')
        }, 500)
    }
  }

  stop () {
    if (this.stdout.isTTY && this.intervalId) {
      this.stdout.clearLine()
      this.stdout.cursorTo(0)
      this.clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

module.exports = ProgressService

