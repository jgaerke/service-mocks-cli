# svcmocks cli

This CLI will give you options to manage your mocks published to servicemocks.com locally or in your build automation.

## Installation
 
    npm install -g svcmocks

## Usage   
  Usage: svcmocks <command> [options]


  Options:

    -V, --version  output the version number
    -d, --debug    show debug info
    -h, --help     output usage information


  Commands:

    config [options]                                               Set configuration options
    mock:list [options]                                            List mocks
    mock:manage [name] [version]                                   Manage mock in console
    mock:contract [name] [version]                                 View mock contract
    mock:contract:upload [options] <file>                          Upload mock contract
    mock:instance:add [mock] [version] [instance]                  Add instance to mock
    mock:instance:remove [mock] [version] [instance]               Remove instance from mock
    mock:state:get [mock] [version] [resource] [instance]          Display mock state
    mock:state:set [mock] [version] [resource] [instance] [state]  Set mock state