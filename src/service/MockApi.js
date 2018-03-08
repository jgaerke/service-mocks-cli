class MockApi {
  constructor (axios, apiUrlBase, progressService, configurationService) {
    this.axios = axios
    this.apiUrlBase = apiUrlBase
    this.progressService = progressService
    this.configurationService = configurationService
  }

  list (skip, limit) {
    return withProgress(
      this,
      this.axios.get(`${this.apiUrlBase}/mocks?skip=${skip}&limit=${limit}&calcTotalCount=true`, prepareHeaders(this))
    )
  }

  get (id) {
    return withProgress(
      this,
      this.axios.get(`${this.apiUrlBase}/mocks/${id}`, prepareHeaders(this))
    )
  }

  getByName (name) {
    return withProgress(
      this,
      this.axios.get(`${this.apiUrlBase}/mocks?name=${name}`, prepareHeaders(this))
    )
  }

  getState (mockId) {
    return withProgress(
      this,
      this.axios.get(`${this.apiUrlBase}/mocks/${mockId}/states`, prepareHeaders(this))
    )
  }

  setState (mockId, state) {
    return withProgress(
      this,
      this.axios.patch(`${this.apiUrlBase}/mocks/${mockId}/states`, state, prepareHeaders(this))
    )
  }
}

module.exports = MockApi

const prepareHeaders = (thisArg) => {
  return {
    headers: {
      'x-api-key': thisArg.configurationService.get().apiKey,
      'x-service-mocks-cli': 'true'
    }
  }
}

const withProgress = (thisArg, promise) => {
  thisArg.progressService.start()
  return promise
    .then((response) => {
      thisArg.progressService.stop()
      return response
    })
    .catch((err) => {
      thisArg.progressService.stop()
      const {response} = err
      const error = response.data || {status: response.status, statusText: response.statusText}
      return Promise.reject(error)
    })
}