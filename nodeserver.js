var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxy();
var urlparser = require('url');

module.exports = exports = new function() {
	var self = this;
	this.websites = [];
	this.ports = [];


	this.serverWorker = function(req, res) {
		var host = req.headers.host;
		var website = self.getWebsiteFromUrl(host);

		if(website == null) {
			res.end();
			return;
		}

		proxy.web(req, res, {
			target: website.target
		}, function(e) {
			console.log(e);
		});
	};

	this.server = require('http').createServer(this.serverWorker);
	
	this.getWebsiteFromUrl = function(url) {
		var websitesCount = this.websites.length;

		for(var i = 0; i < websitesCount; i++) {
			var website = this.websites[i];
			var bindingsCount = website.bindings.length;

			for(var j = 0; j < bindingsCount; j++) {
				var binding = website.bindings[j];

				if(binding == url) {
					return website;
				}
			}
		}
	}


	this.addWebsite = function(website) {
		/*var bindings = website.bindings;

		for(var i = 0; i < bindings.length; i++) {
			bindings[i] = urlparser.parse(bindings[i]);
		}*/

		this.websites.push(website);
	};


	this.addPort = function(port) {
		this.ports.push(port);
	};


	this.start = function() {
		var ports = this.ports.length;

		for(var i = 0; i < ports; i++) {
			console.log(this.ports[i]);
			this.server.listen(this.ports[i]);
		}
	};


	this.stop = function() {
		this.server.close();
	};


	this.restart = function() {
		this.stop();
		this.start();
	};
};