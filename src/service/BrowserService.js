class BrowserService {
  constructor (opn) {
   this.opn = opn
  }

  open(url) {
    this.opn(url, {wait:false})
  }
}

module.exports = BrowserService