nodeserver History Version
==========================


## Lasts versions

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