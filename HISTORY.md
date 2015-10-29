nodeserver History Version
==========================


## Lasts versions

### v0.7

#### v0.7.0

* Clean nodeserver bash script
* Change nodeserver script init from instance class to a class for initialize with a param 'inTerminal'. Example new require('nodeserver')(false)
* Check in terminal if socket exits but not a server listen, kill this socket and show a message 'server not running'
* Updated the mocha tests at last version
* Update package version to new version v0.7.0

### v0.6

#### v0.6.3

* Fixed an error with regex domains bindings

#### v0.6.2

* Fixed an error with regex domains bindings

#### v0.6.1

* Add status information on shell $ nodeserver status
* Add example on readme of status output

#### v0.6.0

* Change not respond websites from 400 to 504 HTTP code
* Deleted reboot button on admin. Now use stop and start buttons
* Refactored website model
* Refactored worker for nodejs to external workers file with cgi worker
* Added log in admin with the last 100 log lines

### v0.5

#### v0.5.4

* New worker class for manage all request for nodejs and cgi.
* Add a new method getWebsiteFromBinding instead of getWebsiteFromUrl and getWebsiteFromSecureUrl

#### v0.5.3

* Added a 400 error when a site is down
* Fixed a error that shutdown server when a cgi site port is over 65536
* Deleted old xml mimes and added all to mimes.json

#### v0.5.2

* Updated documentation of install and use

#### v0.5.1

* Fixed some errors on install system

#### v0.5.0

* Added terminal daemon for start
* Added terminal daemon for status
* Added terminal daemon for stop
* Change website id format
* Encrypted password for access to the admin
* Refresh without stop the server all websites
* Change absoluteScript configuration to optionaly and mark false by default
* Add installation system for CentOS

### v0.4

#### v0.4.0

* Added support for ssl. New configuration security json for specify certificates and ssl binding (443 for default).

### v0.3

#### v0.3.2

* fixed a error when uses a root domain and subdomians. When use domain like demo.com with a home website and services.demo.com the regex pattern resolve the root domain demo.com when uses http://services.demo.com.

#### v0.3.1

* Added server logo to admin website
* Added support to wildcard with regex to bindings domains

#### v0.3.0

* New admin interface
* Fixed many bugs

### v0.2

#### v0.2.0

* New config with sites and nodeserver config
* Admin interface configuration

### v0.1

#### v0.1.2

* Server file .js and package.json are watched when change restar this node server

#### v0.1.1

* Fixed a error in CentOS node install

#### v0.1.0

* Daemon funtionality with config file and forever monitor