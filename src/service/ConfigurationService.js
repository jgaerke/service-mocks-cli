
class ConfigurationService {
  constructor (fs, configPath, json) {
    this.fs = fs
    this.configPath = configPath
    this.json = json
  }

  get () {
    if (!this.fs.existsSync(this.configPath)) {
      return {}
    }
    return this.json.parse(this.fs.readFileSync(this.configPath).toString())
  }

  set (config) {
    this.fs.writeFileSync(this.configPath, this.json.stringify(config, null, 2) + '\n')
  }

  isApiKeyConfigured () {
    return !!this.read().apiKey
  }
}

module.exports = ConfigurationService