nodeserver
==========

Production webserver for Node.js applications, php websites, statics websites, etc.

![nodeserver logo](https://raw.githubusercontent.com/altairstudios/nodeserver/master/nodeserver-logo.png)

Nodeserver is a production webserver Node.js applications. It allows you to keep applications alive forever, to reload them, start webistes on php or html, reverse proxy.

If you have ideas or questions, open a new issue with your ideas.

[![Version npm](https://img.shields.io/npm/v/nodeserver.svg?style=flat-square)](https://www.npmjs.com/package/nodeserver)[![NPM Downloads](https://img.shields.io/npm/dm/nodeserver.svg?style=flat-square)](https://www.npmjs.com/package/nodeserver)[![Travis Build Status](https://api.travis-ci.org/altairstudios/nodeserver.svg)](https://travis-ci.org/altairstudios/nodeserver)



### How install

Install nodeserver script via npm:

	$ sudo npm install nodeserver -g

Install daemon on the system. Currently only support CentOS.

	$ sudo nodeserver install centos


### Configuration

Nodeserver can read a configuration in /etc/nodeserver/nodeserver.config

The syntax of these file are:

	{
		"nodeserver": {
			"admin": {
				"active": [true|false],
				"port": admin-port-number,
				"user": "user-for-admin",
				"password": "hash-password"
			}
		},
		"sites": [{
			"name": "website name",
			"type": "node|cgi",
			"bindings": [
				"example.com:80",
				"www.example.com:80",
				"otherbindings:8080",
			],
			"port": "internal port number for the project, do not repeat it. Only for node"
			"script": "absolute script for server.js for node or doc_root for php (cgi)",
			"security": {
				"certs": {
					"key": "/absolutepath/keycert.key",
					"cert": "/absolutepath/cert.cert",
					"ca": ["/absolutepath/ca.cert"]
				},
				"bindings": [
					"securehostforhttps.com:443",
					"www.securehostforhttps.com:443"
				]
			},
		}, {
			"name": "php website",
			"type": "cgi",
			"bindings": [
				"myphpsite.com:80"
			],
			"script": "/var/www/phpsite"
		}, {
			"name": "standar nodejs site",
			"type": "node",
			"bindings": [
				"standarnodejs.com:80"
			],
			"port": "10001",
			"script": "/var/www/nodejs1/server.js"
		}, {
			"name": "secure nodejs site",
			"type": "node",
			"bindings": [
				"securenodejs.com:80"
			],
			"port": "10002",
			"security": {
				"certs": {
					"key": "/absolutepath/keycert.key",
					"cert": "/absolutepath/cert.cert",
					"ca": ["/absolutepath/ca.cert"]
				},
				"bindings": [
					"securenodejs.com:443"
				]
			},
			"script": "/var/www/nodejs2/server.js"
		},
		"this-is-a-file-include-located-in-sites-name-dot-config"
		]
	}


### Servers operations

Start server

	$ sudo nodeserver start

Check status and show a list of active webites

	$ nodeserver status

![nodeserver status](https://raw.githubusercontent.com/altairstudios/nodeserver/master/images/status.png)

Stop the server

	$ nodeserver stop

Reload server configuration if nodeserver.config change without stop the server

	$ nodeserver reload

Generate a hash password for use in config file

	$ nodeserver password mypasswordtohash


## Thanks

NodeServer is a free and open source community-driven project.

Thanks to the following companies and projects whose work we have used or taken inspiration from in the making of NodeServer:

* [AltairStudios](http://www.altairstudios.es)
* [Node.js](http://www.nodejs.org)
* [KeystoneJS](http://www.keystonejs.com)
* [ExpressJS](http://www.expressjs.com)
* [Digital Ocean](http://www.digitalocean.com/)



## License

(The MIT License)

Copyright (c) 2014-2015 Juan Benavides

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
