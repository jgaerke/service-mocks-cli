class MockApi {
  constructor (axios, progressService, configurationService) {
    this.axios = axios
    const config = configurationService.get()
    this.apiUrl = config.apiUrl
    this.apiKey = config.apiKey
    this.authToken = config.authToken
    this.progressService = progressService
    this.configurationService = configurationService
  }

  list (skip, limit) {
    return withProgress(
      this,
      this.axios.get(`${this.apiUrl}/mocks?skip=${skip}&limit=${limit}&calcTotalCount=true`, prepareHeaders(this))
    )
  }

  get (id) {
    return withProgress(
      this,
      this.axios.get(`${this.apiUrl}/mocks/${id}`, prepareHeaders(this))
    )
  }

  getByNameAndVersion (name, version) {
    return withProgress(
      this,
      this.axios.get(`${this.apiUrl}/mocks?name=${name}&version=${version}`, prepareHeaders(this))
    )
  }

  getState (mockId) {
    return withProgress(
      this,
      this.axios.get(`${this.apiUrl}/mocks/${mockId}/states`, prepareHeaders(this))
    )
  }

  patchState (mockId, state) {
    return withProgress(
      this,
      this.axios.patch(`${this.apiUrl}/mocks/${mockId}/states`, state, prepareHeaders(this))
    )
  }

  putState (mockId, state) {
    return withProgress(
      this,
      this.axios.put(`${this.apiUrl}/mocks/${mockId}/states`, state, prepareHeaders(this))
    )
  }
}

module.exports = MockApi

const prepareHeaders = (thisArg) => {
  return {
    headers: {
      'x-api-key': thisArg.apiKey,
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