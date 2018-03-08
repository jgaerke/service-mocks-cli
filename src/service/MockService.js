const Table = require('cli-table')

class MockService {
  constructor (mockApi, browserService, inquirer) {
    this.mockApi = mockApi
    this.browserService = browserService
    this.inquirer = inquirer
    this.currentState = null
    this.mockByName = null
    this.selectedMock = null
    this.selectedResource = null
    this.selectedInstance = null
  }

  getMockState (mock) {
    this.currentState = null
    this.mockByName = null
    this.selectedMock = mock
    if (mock) {
      return getMockByName(this, mock).then((m) => {
        return getConsoleStateOutputForSelectedMock(this, m)
      })
    }
    return getMockSelection(this)
      .then((mock) => {
        return getConsoleStateOutputForSelectedMock(this, mock)
      })
  }

  setMockState (mock, resource, instance, state) {
    this.currentState = null
    this.mockByName = null
    this.selectedMock = mock
    this.selectedResource = resource
    this.selectedInstance = instance
    if (mock && resource && instance && state) {
      return updateState(this, mock, {
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
        return updateState(this, mock, {
          [resource]: {
            [instance]: state
          }
        })
      })
  }

  manageMock() {
    this.mockByName = null
    this.selectedMock = null
    return getMockSelection(this)
      .then((mock) => {
        this.browserService.open('https://servicemocks.com')
      })
  }
}

const getConsoleStateOutputForSelectedMock = (thisArg, mock) => {
  if (!mock) {
    return Promise.reject({message: `Mock not found`})
  }
  return thisArg.mockApi.getState(mock.id).then((response) => {
    return parseResources(mock.name, response.data)
  })
}

const parseResources = (mockName, resources) => {
  const table = new Table({
    head: ['Mock'.green, 'Resource'.green, 'Instance'.green, 'State'.green]
  })
  Object.keys(resources).forEach((resourceName) => {
    parseInstances(mockName, resourceName, resources[resourceName], table)
  })
  return table.toString()
}

const parseInstances = (mockName, resourceName, instances, table) => {
  Object.keys(instances).forEach((instanceName) => {
    parseStates(mockName, resourceName, instanceName, instances[instanceName], table)
  })
}

const parseStates = (mockName, resourceName, instanceName, states, table) => {
  states.forEach((stateName) => {
    table.push([mockName, resourceName, instanceName, stateName])
  })
}

const updateState = (thisArg, mockName, state) => {
  return getMockByName(thisArg, mockName).then((mock) => {
    if (!mock) {
      return Promise.reject({message: `Mock not found for name: ${mockName}`})
    }
    return thisArg.mockApi.setState(mock.id, state)
  })
}

const getMockByName = (thisArg, name, refresh = false) => {
  if (!refresh && thisArg.mockByName) {
    return Promise.resolve(thisArg.mockByName)
  }
  return thisArg.mockApi.getByName(name).then((response) => {
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
    let choices = mocks.map((m) => {
      return {
        name: m.name,
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
      thisArg.selectedMock = match.name
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