# svcmocks cli

This CLI will give you options to manage your mocks published to servicemocks.com locally or in your build automation.

## Installation
 
    npm install -g svcmocks

## Usage   

    Usage: svcmocks \[options\] \[command\]
    
    Options:  
    -V, --version  output the version number  
    -h, --help     output usage information

	Commands:  
  
	config <api-key>  Configure api key for use in CLI calls.  
	list [options] <collection> List users, accounts, or mocks  
	get [options] <collection> <id> Get user, account, or mock  
	create [options] <collection> <file> Create user, account, or mock  
	update [options] <collection> <file> Update user, account, or mock  
	delete [options] <collection> <id> Delete user, account, or mock by id  
	set-state [options] [mockId\] [resource\] [instance] [state] Update mock resource/instance state
