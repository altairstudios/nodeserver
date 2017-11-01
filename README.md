nodeserver
==========

Production webserver for Node.js applications, php websites, statics websites, etc.

![nodeserver logo](https://raw.githubusercontent.com/altairstudios/nodeserver/master/nodeserver-logo.png)

Nodeserver is a production webserver Node.js applications. It allows you to keep applications alive forever, to reload them, start webistes on php or html, reverse proxy.

If you have ideas or questions, open a new issue with your ideas.

[![Version npm](https://img.shields.io/npm/v/nodeserver.svg?style=flat-square)](https://www.npmjs.com/package/nodeserver)[![NPM Downloads](https://img.shields.io/npm/dm/nodeserver.svg?style=flat-square)](https://www.npmjs.com/package/nodeserver)[![Travis Build Status](https://api.travis-ci.org/altairstudios/nodeserver.svg)](https://travis-ci.org/altairstudios/nodeserver)



## How install

Install nodeserver script via npm:

```bash
$ sudo npm install nodeserver -g
```

Install daemon on the system. Currently only support CentOS.

```bash
$ sudo nodeserver install centos
```


## Configuration

By default nodeserver read configuration in /etc/nodeserver/nodeserver.config

You can use other path using the command:

```bash
$ nodeserver start /path/to/config
```

or use loop nodeserver with

```bash
$ nodeserver start-loop /path/to/config
```


### Basic configuration

The basic configuration file are json with format:

```json
{
  "nodeserver": {
    "admin": {
      "active": "true|false - active the admin web interface",
      "port": "admin listen port. We recommend use port 10000",
      "user": "user for admin access, we recommend not use admin, root or similars",
      "password": "hash password. See generate password section"
    }
  },
  "sites": []
}
```

The admin interface is a web page where administrator can start, stop process, view logs, etc. If active is false, the other options not mandatory.


### Site configuration

Sites is a array of sites. The site has the next format:

```json
{
  "name": "Site name, identify in administrator cli or web",
  "type": "Site type use supported workers: cdn, cgi, php, node, python",
  "bindings": ["array of string with domain (or ip) and port. By default use domain and port 80: example.com:80"],
  "port": "use only in node site. Start the node site in theese port",
  "script": "absolute path of script server in node sites or document root in php, cgi o cdn sites",
  "security": {
    "certs": {
      "key": "absolute path for certificate key",
      "cert": "absolute path for certificate",
      "ca": ["array of certificate ca"]
    },
    "bindings": [
      "similar to bindings option but uses only for SSL connection. By default use domain with port 443, example.com:443"
    ]
  }
}
```

The port option is only mandatory for nodejs sites.

Use the security option only if you use a SSL in sites.


### Reference site configuration

In config file you can use a string for any site where determine the relative path for configuration site. If use /etc/nodeserver for configuration you can create a "sites" folder inside and save a example.config for save json configuration for this site.

A simple configuration nodeserver.config is:

```json
{
  "nodeserver": {
    "admin": {
      "active": false
    }
  },
  "sites": [
    "sites/example.com"
  ]
}
```

The site / example.com.config file are:

```json
{
  "name": "Example site",
  "type": "cdn",
  "bindings": [
    "example.com:80"
  ],
  "script": "/var/web/example.com"
}
```


### Servers operations

Start server

```bash
  $ sudo nodeserver start
```

Check status and show a list of active webites

```bash
  $ nodeserver status
```

![nodeserver status](https://raw.githubusercontent.com/altairstudios/nodeserver/master/images/status.png)

Stop the server

```bash
  $ nodeserver stop
```

Reload server configuration if nodeserver.config change without stop the server

```bash
  $ nodeserver reload
```

Generate a hash password for use in config file

```bash
  $ nodeserver password mypasswordtohash
```

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

Copyright (c) 2014-2017 Juan Benavides

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
