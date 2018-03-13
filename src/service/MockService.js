const Table = require('cli-table')

class MockService {
  constructor (mockApi, configurationService, browserService, inquirer) {
    this.mockApi = mockApi
    this.configurationService = configurationService
    this.browserService = browserService
    this.inquirer = inquirer
    this.currentState = null
    this.mockByNameAndVersion = null
    this.selectedMock = null
    this.selectedResource = null
    this.selectedInstance = null
  }

  getMockList () {
    if(!this.configurationService.isApiConfigured()) {
      return Promise.reject({message: `Please run 'config --api-key <api-key>' command and try again`})
    }
    return getMocks(this, 0, 100)
      .then((response) => {
        const table = new Table({
          head: ['Mock'.green, 'Version'.green, 'Account'.green, 'URL'.green]
        })
        response.mocks.forEach((mock) => {
          table.push([mock.name, mock.version, mock.account, mock.url])
        })
        return table.toString()
      })
  }

  getMockState (mock, version) {
    if(!this.configurationService.isApiConfigured()) {
      return Promise.reject({message: `Please run 'config --api-key <api-key>' command and try again`})
    }
    this.currentState = null
    this.mockByNameAndVersion = null
    this.selectedMock = {name: mock, version}
    if (mock && version) {
      return getMockByNameAndVersion(this, mock, version).then((m) => {
        return getConsoleStateOutputForSelectedMock(this, m)
      })
    }
    return getMockSelection(this)
      .then((mock) => {
        return getConsoleStateOutputForSelectedMock(this, mock)
      })
  }

  setMockState (mock, version, resource, instance, state) {
    if(!this.configurationService.isApiConfigured()) {
      return Promise.reject({message: `Please run 'config --api-key <api-key>' command and try again`})
    }
    this.currentState = null
    this.mockByNameAndVersion = null
    this.selectedMock = null
    this.selectedResource = resource
    this.selectedInstance = instance
    if (mock && version && resource && instance && state) {
      return updateState(this, mock, version, {
        [resource]: {
          [instance]: state
        }
      })
    }
    return getMockSelection(this)
      .then((mock) => {
        return getResourceSelection(this, mock)
      })
      .then(({mock, resource}) => {
        return getInstanceSelection(this, mock.id, resource)
      })
      .then((states) => {
        return getStateSelection(this, states)
      })
      .then(({mock, resource, instance, state}) => {
        return updateState(this, mock.name, mock.version, {
          [resource]: {
            [instance]: state
          }
        })
      })
  }

  manageMockDefinition (mock, version) {
    if(!this.configurationService.isApiConfigured()) {
      return Promise.reject({message: `Please run 'config --api-key <api-key>' command and try again`})
    }
    this.mockByNameAndVersion = null
    this.selectedMock = null
    if (mock && version) {
      return getMockByNameAndVersion(this, mock, version).then((mock) => {
        return openMockInConsole(this, mock)
      })
    }
    return getMockSelection(this)
      .then((mock) => {
        return openMockInConsole(this, mock)
      })
  }

  manageMockContract (mock, version) {
    if(!this.configurationService.isApiConfigured()) {
      return Promise.reject({message: `Please run 'config --api-key <api-key>' command and try again`})
    }
    this.mockByNameAndVersion = null
    this.selectedMock = null
    if (mock && version) {
      return getMockByNameAndVersion(this, mock, version).then((mock) => {
        return openContractInSource(this, mock)
      })
    }
    return getMockSelection(this)
      .then((mock) => {
        return openContractInSource(this, mock)
      })
  }
}

const openMockInConsole = (thisArg, mock) => {
  const {consoleUrl} = thisArg.configurationService.get()
  const mockUrl = `${consoleUrl}/mocks/${mock.id}`
  thisArg.browserService.open(mockUrl)
  return Promise.resolve()
}

const openContractInSource = (thisArg, mock) => {
  const {
    contract = {}
  } = mock
  const {
    url
  } = contract
  if(!url) {
    return Promise.reject({message:`Contract not defined for mock name: ${mock.name} version: ${mock.version}`})
  }
  thisArg.browserService.open(url)
  return Promise.resolve()
}

const getConsoleStateOutputForSelectedMock = (thisArg, mock) => {
  if (!mock) {
    return Promise.reject({message: `Mock not found`})
  }
  return thisArg.mockApi.getState(mock.id).then((response) => {
    return parseResources(mock.name, mock.version, response.data)
  })
}

const parseResources = (mockName, mockVersion, resources) => {
  const table = new Table({
    head: ['Mock'.green, 'Version'.green, 'Resource'.green, 'Instance'.green, 'State'.green, 'Active'.green]
  })
  Object.keys(resources).forEach((resourceName) => {
    parseInstances(mockName, mockVersion, resourceName, resources[resourceName], table)
  })
  return table.toString()
}

const parseInstances = (mockName, mockVersion, resourceName, instances, table) => {
  Object.keys(instances).forEach((instanceName) => {
    parseStates(mockName, mockVersion, resourceName, instanceName, instances[instanceName], table)
  })
}

const parseStates = (mockName, mockVersion, resourceName, instanceName, states, table) => {
  states.forEach((state) => {
    table.push([mockName, mockVersion, resourceName, instanceName, state.name, state.active])
  })
}

const updateState = (thisArg, mockName, mockVersion, state) => {
  return getMockByNameAndVersion(thisArg, mockName, mockVersion).then((mock) => {
    if (!mock) {
      return Promise.reject({message: `Mock not found for name: ${mockName} version: ${mockVersion}`})
    }
    return thisArg.mockApi.setState(mock.id, state)
  })
}

const getMockByNameAndVersion = (thisArg, name, version, refresh = false) => {
  if (!refresh && thisArg.mockByNameAndVersion) {
    return Promise.resolve(thisArg.mockByNameAndVersion)
  }
  return thisArg.mockApi.getByNameAndVersion(name, version).then((response) => {
    const {data = {}} = response
    const {mocks = []} = data
    if (mocks.length) {
      return mocks[0]
    }
  })
}

const getMocks = (thisArg, skip, limit) => {
  return thisArg.mockApi.list(skip, limit).then((response) => {
    return Object.assign({mocks: [], metadata: {skip: 0, limit: 10}}, response.data)
  })
}

const getMockSelection = (thisArg) => {
  return presentMockChoices(thisArg, 0, 10)
}

const presentMockChoices = (thisArg, skip, limit) => {
  return getMocks(thisArg, skip, limit).then((response) => {
    const {
      mocks = [],
      metadata = {
        totalCount: 0
      }
    } = response
    if (!mocks.length) {
      return Promise.reject({message: 'No mocks found'})
    }
    let choices = mocks.map((m) => {
      return {
        name: `${m.name} (${m.version})`,
        value: m.id
      }
    })
    const {
      totalCount = 0
    } = metadata
    if ((skip + 1) * limit < totalCount) {
      choices = choices.concat([
        {
          name: 'next ...',
          value: 'next'
        }
      ])
    }

    return thisArg.inquirer.prompt([{
      type: 'list',
      name: 'mock',
      message: 'Select mock',
      choices,
      filter: function (val) {
        return val.toLowerCase()
      }
    }]).then((answers) => {
      const {mock} = answers
      if (mock === 'next') {
        return presentMockChoices(thisArg, skip + limit, limit)
      }
      const match = mocks.find((m) => m.id === mock)
      thisArg.selectedMock = {name: match.name, version: match.version}
      return match
    })
  })
}

const getResourceSelection = (thisArg, mock) => {
  return presentResourceChoices(thisArg, mock)
}

const presentResourceChoices = (thisArg, mock) => {
  return getMockState(thisArg, mock.id).then((state) => {
    const resources = Object.keys(state)
    return thisArg.inquirer.prompt([{
      type: 'list',
      name: 'resource',
      message: 'Select resource',
      choices: resources,
    }]).then((answers) => {
      const {resource} = answers
      thisArg.selectedResource = resource
      return {mock, resource}
    })
  })
}

const getInstanceSelection = (thisArg, mockId, resource) => {
  return presentInstanceChoices(thisArg, mockId, resource)
}

const presentInstanceChoices = (thisArg, mockId, resource) => {
  return getMockState(thisArg, mockId).then((state) => {
    const instances = state[resource]
    const choices = Object.keys(instances)
    return thisArg.inquirer.prompt([{
      type: 'list',
      name: 'instance',
      message: 'Select instance',
      choices,
    }]).then((answers) => {
      const {instance} = answers
      thisArg.selectedInstance = instance
      return instances[instance]
    })
  })
}


const getStateSelection = (thisArg, states) => {
  return presentStateChoices(thisArg, states)
}

const presentStateChoices = (thisArg, states) => {
  return thisArg.inquirer.prompt([{
    type: 'list',
    name: 'state',
    message: 'Select state',
    choices: states,
  }]).then((answers) => {
    const {state} = answers
    return {
      mock: thisArg.selectedMock,
      resource: thisArg.selectedResource,
      instance: thisArg.selectedInstance,
      state: state
    }
  })
}

const getMockState = (thisArg, mockId, refresh = false) => {
  if (!refresh && thisArg.currentState) {
    return Promise.resolve(thisArg.currentState)
  }
  return thisArg.mockApi.getState(mockId).then((state) => {
    thisArg.currentState = state.data
    return state.data
  })
}

module.exports = MockService