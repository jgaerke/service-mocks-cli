const API_URL = 'https://api.servicemocks.com'
const CONSOLE_URL = 'https://console.servicemocks.com'
const WorkDirUtil = require('../util/WorkDirUtil')
const Table = require('cli-table')

class ConfigurationService {
  constructor (fs, json) {
    this.fs = fs
    this.configPath = WorkDirUtil.ensureAndGet() + 'config.json'
    this.json = json
  }

  get () {
    if (!this.fs.existsSync(this.configPath)) {
      return {}
    }
    const config = this.json.parse(this.fs.readFileSync(this.configPath).toString())
    return withDefaults(config)
  }

  set (config) {
    config = Object.assign({}, withNoInvalidData(this.get()), config)
    this.fs.writeFileSync(this.configPath, this.json.stringify(config, null, 2) + '\n')
  }

  list () {
    const table = new Table({
      head: ['Key'.green, 'Value'.green]
    })
    const config = this.get()
    console.log('here')
    Object.keys(config).forEach((key) => {
      table.push([key, config[key]])
    })
    return table.toString()
  }

  isApiConfigured () {
    const config = this.get()
    return !!config.apiUrl && !!config.apiKey
  }

  isConsoleConfigured () {
    const config = this.get()
    return !!config.consoleUrl
  }
}

const withDefaults = (data = {}) => {
  return Object.assign({}, {apiUrl: API_URL, consoleUrl: CONSOLE_URL}, data)
}

const withNoInvalidData = (data = {}) => {
  if (data.apiKey && data.apiUrl === '') {
    delete data.apiUrl
  }
  if (data.apiKey && data.apiKey === '') {
    delete data.apiKey
  }
  if (data.consoleUrl && data.consoleUrl === '') {
    delete data.consoleUrl
  }
  return Object.assign({}, {apiUrl: API_URL, consoleUrl: CONSOLE_URL}, data)
}

module.exports = ConfigurationService