#!/usr/bin/env node

const fs = require('fs')
const program = require('commander')
const {prompt} = require('inquirer')
const _ = require('lodash')
const chalk = require('chalk')
const axios = require('axios')
const log = console.log

let selectedMock, selectedResource, selectedInstance, validStates
const folder = (process.platform === 'win32') ? '\.svcmocks' : '/.svcmocks'

const getUserHome = () => {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}


const configDir = `${getUserHome()}${folder}`
const configFile = `${configDir}/config.json`


const prettyPrint = (data) => {
  return JSON.stringify(data, null, 2)
}

const success = (data) => {
  if (data) {
    log(prettyPrint(data))
  }
}

const error = (err) => {
  log(chalk.white.bgRed.bold('Error:'), err)
}

const responseError = (message) => {
  return (err) => {
    error(message)
    if (err) {
      if (err.response) {
        error(prettyPrint({
          status: err.response.status,
          details: err.response.data
        }))
      }
    }
  }
}

const isValidCollection = (collection) => {
  return ['users', 'accounts', 'mocks'].includes(collection)
}

const getCurrentApiKey = () => {
  return readConfig().apiKey
}

const prepareHeaders = () => {
  return {
    headers: {
      'x-api-key': getCurrentApiKey()
    }
  }
}

const formatToVerbosityLevel = (collection, data, verbose) => {
  if (!_.isNil(data[collection]) && _.isArray(data[collection])) {
    return data[collection].map((i) => {
      if (collection === 'mocks' && !verbose) {
        return {
          id: i.id,
          name: i.name,
          url: i.url,
          resources: (i.resources || []).length
        }
      }
      return i
    })
  }
  if (typeof data === 'object') {
    if (collection === 'mocks' && !verbose) {
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        resources: (data.resources || []).length
      }
    }
  }
  return data
}

const apiUrlBase = 'https://api.servicemocks.com'

const api = {
  list: (collection, skip, limit) => {
    return axios.get(`${apiUrlBase}/${collection}?skip=${skip}&limit=${limit}`, prepareHeaders())
  },
  create: (collection, data) => {
    return axios.post(`${apiUrlBase}/${collection}`, data, prepareHeaders())
  },
  get: (collection, id) => {
    return axios.get(`${apiUrlBase}/${collection}/${id}`, prepareHeaders())
  },
  update: (collection, id, data) => {
    return axios.put(`${apiUrlBase}/${collection}/${id}`, data, prepareHeaders())
  },
  delete: (collection, id) => {
    return axios.post(`${apiUrlBase}/${collection}/${id}`, prepareHeaders())
  },
  getValidStates: (id) => {
    return axios.get(`${apiUrlBase}/mocks/${id}/states`, prepareHeaders())
  },
  setState: (mockId, state) => {
    return axios.patch(`${apiUrlBase}/mocks/${mockId}/states`, state, prepareHeaders())
  }
}

const saveData = (file, data) => {
  fs.writeFileSync(`${file}.json`, JSON.stringify(data, null, 2))
}

const writeConfig = (apiKey) => {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir)
  }
  fs.writeFileSync(configFile, JSON.stringify({apiKey}, null, 2))
  success(`Your config file is here: ${configFile}`)
}

const readConfig = () => {
  if (!fs.existsSync(configFile)) {
    return
  }
  try {
    return JSON.parse(fs.readFileSync(configFile).toString())
  } catch (e) {
    error(`Error reading config. Check ${configFile} to make sure it is present and properly formatted`)
    throw e
  }
}

const list = (collection, skip = 0, limit = 10, verbose = false, persist = false) => {
  if (!isValidCollection(collection)) {
    return Promise.reject(`${collection} is not a valid collection`)
  }
  return api.list(collection, skip, limit).then((response) => {
    const data = formatToVerbosityLevel(collection, response.data || {
        [collection]: [],
        metadata: {totalCount: 0}
      }, verbose)
    if (persist) {
      saveData(collection, data)
    }
    return data
  }).catch(responseError(`Error listing ${collection}`))
}

const get = (collection, id, verbose = false, persist = false) => {
  if (!isValidCollection(collection)) {
    return Promise.reject(`${collection} is not a valid collection`)
  }
  return api.get(collection, id).then((response) => {
    const data = formatToVerbosityLevel(collection, response.data || {}, verbose)
    if (persist) {
      if (collection.endsWith('s')) {
        collection = collection.substr(0, collection.length - 1)
      }
      saveData(`mock-${id}`, data)
    }
    return data
  }).catch(responseError(`Error getting ${id} from ${collection}`))
}

const create = (collection, file, verbose = false) => {
  if (!isValidCollection(collection)) {
    return Promise.reject(`${collection} is not a valid collection`)
  }
  const data = readFile(file)
  return api.create(collection, data).then((response) => {
    return formatToVerbosityLevel(collection, response.data || {}, verbose)
  }).catch(responseError(`Error creating ${collection} item`))
}

const update = (collection, file, verbose = false) => {
  if (!isValidCollection(collection)) {
    return Promise.reject(`${collection} is not a valid collection`)
  }
  const data = readFile(file)
  const id = data.id
  if (!id) {
    return error('id required to update resource')
  }
  delete data.id
  return api.update(collection, id, data).then((response) => {
    return formatToVerbosityLevel(collection, response.data || {}, verbose)
  }).catch(responseError(`Error updating ${collection} item`))
}

const del = (collection, id, verbose = false) => {
  if (!isValidCollection(collection)) {
    return Promise.reject(`${collection} is not a valid collection`)
  }
  return api.delete(collection, id).then(() => {
    return {success: true}
  }).catch(error)
}

const getValidStates = (id) => {
  return api.getValidStates(id).then((response) => {
    return response.data
  }).catch(responseError(`Error getting valid mock states`))
}

const setState = (mockId, resource, instance, state, verbose = false) => {
  const updatedState = {
    [resource.name]: {
      [instance]: state
    }
  }

  return api.setState(mockId, updatedState).then((response) => {
    return formatToVerbosityLevel('mocks', response.data || {}, verbose)
  }).catch(responseError(`Error updating mock state`))
}

const showOptions = (options = []) => {
  options.forEach((option, idx) => {
    log(`${idx + 1}: ${option}`)
  })
}

const promptFor = (input, options = {}) => {
  const question = {
    type: 'input',
    name: 'value',
    message: `Enter ${input}:`
  }
  if (options.default) {
    question.default = defaults
  }
  return prompt([question]).then((answers) => {
    if (!answers['value']) {
      return
    }
    return answers['value']
  })
}

const safeParseInt = (input) => {
  const result = parseInt(input)
  if (isNaN(result)) {
    return -1
  }
  return result
}

const parseBoolean = (input) => {
  if (input === 'true') {
    return true
  }
  return false
}

const showAndPromptUntilMockSelected = (skip = 0, limit = 10) => {
  list('mocks', skip, limit, true).then(({mocks, metadata}) => {
    let mockOptions = mocks.map((m) => m.name)
    let length = mockOptions.length
    if (metadata.totalCount > mocks.length) {
      mockOptions = mockOptions.concat('Next...')
      length = mockOptions.length
    }
    log('\nSelect from these mocks:')
    showOptions(mockOptions)
    log('\n')
    promptFor('# to use').then((selection) => {
      if (selection === 'Next...') {
        return showAndPromptUntilMockSelected(skip = skip + limit - 1, limit)
      }
      const index = safeParseInt(selection)
      if (index < 0 || index > length) {
        return error('Oops, looks like you entered an invalid selection')
      }
      selectedMock = mocks[index - 1]
      showAndPromptUntilResourceSelected(selectedMock, skip, limit)
    })
  }).catch((err) => {
    error(err)
  })
}

const showAndPromptUntilResourceSelected = (mock, skip = 0, limit = 10) => {
  getValidStates(mock.id).then((vStates) => {
    validStates = vStates
    let resourceOptions = Object.keys(vStates)
    let length = resourceOptions.length
    if (resourceOptions.length > limit) {
      length = resourceOptions.length
      resourceOptions = resourceOptions.slice(skip, limit).concat('Next...')
    }
    log(`\nmock: ${mock.name}\n`)
    log('Select from these resources:')
    log('\n')
    showOptions(resourceOptions)
    promptFor('# to use').then((selection) => {
      if (selection === 'Next...') {
        return showAndPromptUntilResourceSelected(mock, skip = skip + limit - 1, limit)
      }
      const index = safeParseInt(selection)
      if (index < 0 || index > length) {
        return error('Oops, looks like you entered an invalid selection')
      }
      selectedResource = mock.resources.find((r) => r.name === resourceOptions[index - 1])
      showAndPromptUntilInstanceSelected(vStates[resourceOptions[index - 1]], skip, limit)
    }).catch((err) => {
      error(err)
    })
  })

}

const showAndPromptUntilInstanceSelected = (instances, skip = 0, limit = 10) => {
  let instanceOptions = Object.keys(instances)
  let length = instanceOptions.length
  if (instanceOptions.length > limit) {
    instanceOptions = instanceOptions.slice(skip, limit).concat('Next...')
    length = instanceOptions.length
  }
  log(`\nmock: ${selectedMock.name} \nresource: ${selectedResource.name}\n`)
  log('Select from these instances:')
  showOptions(instanceOptions)
  log('\n')
  promptFor('# to use').then((selection) => {
    if (selection === 'Next...') {
      return showAndPromptUntilInstanceSelected(resource, skip = skip + limit - 1, limit)
    }
    const index = safeParseInt(selection)
    if (index < 0 || index > length) {
      return error('Oops, looks like you entered an invalid selection')
    }
    selectedInstance = instanceOptions[index - 1]
    showAndPromptUntilStateSelected(instances[selectedInstance], skip, limit)
  }).catch((err) => {
    error(err)
  })
}

const showAndPromptUntilStateSelected = (states, skip = 0, limit = 10) => {
  let stateOptions = states
  let length = stateOptions.length
  if (stateOptions.length > limit) {
    stateOptions = stateOptions.slice(skip, limit).concat('Next...')
    length = stateOptions.length
  }
  console.log('stateOptions', stateOptions)
  log(`\nmock: ${selectedMock.name} \nresource: ${selectedResource.name} \ninstance: ${selectedInstance}\n`)
  log('Select from these states:')
  showOptions(stateOptions)
  log('\n')
  promptFor('# to use').then((selection) => {
    if (selection === 'Next...') {
      return showAndPromptUntilStateSelected(states, skip = skip + limit - 1, limit)
    }
    const index = safeParseInt(selection)
    if (index < 0 || index > length) {
      return error('Oops, looks like you entered an invalid selection')
    }
    log(`\nmock: ${selectedMock.name} \nresource: ${selectedResource.name} \ninstance: ${selectedInstance} \nstate:${stateOptions[index - 1]}\n`)
    setState(selectedMock.id, selectedResource, selectedInstance, stateOptions[index - 1], false)
  }).catch((err) => {
    error(err)
  })
}

program.version('0.0.1')

program
  .command('config <api-key>')
  .description('Configure api key for use in CLI calls.')
  .action((apiKey) => {
    writeConfig(apiKey)
  })

program
  .command('list <collection>')
  .description('List users, accounts, or mocks')
  .option('-s, --skip', 'Starting position in collection. Zero based index')
  .option('-l, --limit', 'Page size to return. Default is 10')
  .option('-p, --persist', 'Save output to .json file matching collection name')
  .option('-v, --verbose', 'Output full detail')
  .action((collection, options) => {
    list(collection, options.skip, options.limit, options.verbose, options.persist).then((data) => {
      success(data)
    }).catch((err) => {
      error(err)
    })
  })

program
  .command('get <collection> <id>')
  .description('Get user, account, or mock')
  .option('-p, --persist', 'Save output to .json file matching non-plural collection name')
  .option('-v, --verbose', 'Output full detail')
  .action((collection, id, options) => {
    get(collection, id, options.verbose, options.persist).then((data) => {
      success(data)
    }).catch((err) => {
      error(err)
    })
  })

program
  .command('create <collection> <file>')
  .description('Create user, account, or mock')
  .option('-v, --verbose', 'Output full detail')
  .action((collection, file, options) => {
    create(collection, file, options.verbose).then((data) => {
      success(data)
    }).catch((err) => {
      error(err)
    })
  })

program
  .command('update <collection> <file>')
  .description('Update user, account, or mock')
  .option('-v, --verbose', 'Output full detail')
  .action((collection, file, options) => {
    update(collection, file, options.verbose).then((data) => {
      success(data)
    }).catch((err) => {
      error(err)
    })
  })

program
  .command('delete <collection> <id>')
  .description('Delete user, account, or mock by id')
  .option('-v, --verbose', 'Output full detail')
  .action((collection, id, options) => {
    del(collection, id, options.verbose).then((data) => {
      success(data)
    }).catch((err) => {
      error(err)
    })
  })

program
  .command('set-state [mockId] [resource] [instance] [state]')
  .description('Update mock resource/instance state')
  .option('-i, --interactive', 'Walk through prompts and select values')
  .option('-v, --verbose', 'Output full detail')
  .action((mockId, resource, instance, state, options) => {
    if ((!mockId || !resource || !instance || !state) && !options.interactive) {
      return error('Must either set all of (mockId, resource, instance, and state) or specify --interactive')
    }
    if (options.interactive) {
      return showAndPromptUntilMockSelected(0, 10)
    }
    setState(mockId, resource, instance, state, options.verbose).then((data) => {
      success(data)
    })
  })


program.parse(process.argv)

// list('mocks', 0, 10, false).then((data) => {
//   log('results', data)
// }).catch((err) => {
//   error(err)
// })
