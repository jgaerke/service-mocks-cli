class BrowserService {
  constructor (opn) {
   this.opn = opn
  }

  open(url) {
    this.opn(url)
  }
}

module.exports = BrowserService