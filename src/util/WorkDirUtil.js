const fs = require('fs')
const path = require('path')
const WORK_DIR = process.env.HOME + `${path.sep}.svcmocks${path.sep}`

class WorkDirUtil {
  static ensureAndGet () {
    if (!fs.existsSync(WORK_DIR)) {
      fs.mkdirSync(WORK_DIR)
    }
    return WORK_DIR
  }
}

module.exports = WorkDirUtil