var httpProxy = require('http-proxy');
var nodeserver = require('./nodeserver');

nodeserver.addWebsite({
	name: "demo",
	type: "proxy",
	bindings: [
		"127.0.0.1:8080",
		"localhsot:8080"
	],
	target: "http://localhost:10000"
});

nodeserver.addPort(8080);

nodeserver.start();