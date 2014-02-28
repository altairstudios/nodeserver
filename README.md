nodeserver
==========

Nodeserver is a NodeJS Web Server with reverse proxy functionality alternative to Nginx reverse proxy for NodeJS projects


## About

Nodeserver gives you:
*	A simple and light webserver written in javascript
*	Reverse proxy for nodejs projects and other web projects

... and also you can modify and adapt the server code.

We have a demo server site at [www.altairstudios.es](http://www.altairstudios.es/) and [www.copitosdenieve.com](http://www.copitosdenieve.com/) where you can see nodeserver in action.

If you have ideas or questions, open a new issue with your ideas.


### Example application script (proxytest.js)

You can found a demo in proxytest.js

Here is an example:
	
	var httpProxy = require('http-proxy');
	var nodeserver = require('nodeserver');

	nodeserver.addWebsite({
		name: "demo",
		type: "proxy",
		bindings: [
			"localhsot"
		],
		target: "http://localhost:10000"
	});

	nodeserver.addPort(80);

	nodeserver.start();



## Thanks

NodeServer is a free and open source community-driven project.

Thanks to the following companies and projects whose work we have used or taken inspiration from in the making of NodeServer:

* [Node.js](http://www.nodejs.org)
* [KeystoneJS](http://www.keystonejs.com)
* [ExpressJS](http://www.expressjs.com)
* [jQuery](http://www.jquery.com)
* [Digital Ocean](http://www.digitalocean.com/)
* [Azure](http://www.windowsazure.com/)
* [Lets Health](http://www.letshealth.com)



## License

(The MIT License)

Copyright (c) 2014 Juan Benavides

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