var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxy({
	xfwd: true
});
var urlparser = require('url');
var fs = require('fs');
var forever = require('forever-monitor');
var path = require('path');
var nodeserverAdmin = require('./admin');
var childProcess = require('child_process');
var os = require('os');
var net = require('net');
require('colors');
var core = require('./core');
var crypto = require('crypto');



module.exports = exports = new function() {
	var self = this;
	this.websites = [];
	this.ports = [];
	this.securePorts = [];
	this.baseCerts = {};
	this.servers = [];
	this.config = null;
	this.unix = (os.platform() == 'darwin' || os.platform() == 'linux');
	this.running = false;
	this.socket = null;
	this.configFile = '/etc/nodeserver/nodeserver.config';

	core.terminal.nodeserver = this;
	core.sockets.nodeserver = this;
	core.workers.nodeserver = this;
	core.workers.proxy = proxy;



	this.hotConfig = function() {
		this.stop();
		this.readConfigFile(this.configFile);
		this.start(false);
	};



	this.getVersion = function() {
		return require('./package.json').version;
	};



	this.getWebsiteFromBinding = function(url, onlySecure) {
		onlySecure = onlySecure | false;

		var containBinding = function(url, bindings, hasRegex) {
			var bindingsCount = bindings.length;

			for(var i = 0; i < bindingsCount; i++) {
				var binding = bindings[i];

				if(hasRegex) {
					var regex = new RegExp("^" + binding + "$", "gi")
					
					if(regex.test(url)) {
						return true;
					}
				} else {
					if(binding == url) {
						return true;
					}
				}
			}

			return false;
		};


		var getWebsite = function(url, websites) {
			var websitesCount = websites.length;

			for(var i = 0; i < websitesCount; i++) {
				var website = websites[i];

				if(website.security) {
					var result = containBinding(url, website.security.bindings, false);
					if(result) return website;
				}

				if(!onlySecure) {
					var result = containBinding(url, website.bindings, false);
					if(result) return website;
				}
			}

			for(var i = 0; i < websitesCount; i++) {
				var website = websites[i];

				if(website.security) {
					var result = containBinding(url, website.security.bindings, true);
					if(result) return website;
				}

				if(!onlySecure) {
					var result = containBinding(url, website.bindings, true);
					if(result) return website;
				}
			}
		}

		var thewebsite = getWebsite(url, self.websites);
		if(thewebsite == null) thewebsite = getWebsite(url + ':80', self.websites);
		if(thewebsite == null) thewebsite = getWebsite(url + ':443', self.websites);

		return thewebsite;
	};



	this.readConfigFile = function(configFile) {
		configFile = configFile || "nodeserver.config";
		var config = null;

		if(fs.existsSync(configFile)) {
			this.configFile = configFile;
			config = fs.readFileSync(configFile);
		} else if(fs.existsSync(__dirname + configFile)) {
			this.configFile = __dirname + configFile;
			config = fs.readFileSync(__dirname + configFile);
		}  else if(fs.existsSync(__dirname + "/" + configFile)) {
			this.configFile = __dirname + "/" + configFile;
			config = fs.readFileSync(__dirname + "/" + configFile);
		} else if(fs.existsSync("/etc/nodeserver/nodeserver.config")) {
			this.configFile = "/etc/nodeserver/nodeserver.config";
			config = fs.readFileSync("/etc/nodeserver/nodeserver.config");
		}

		this.config = JSON.parse(config);

		if(this.config == null) {
			return;
		}

		this.websites = [];

		for(var i = 0; i < this.config.sites.length; i++) {
			this.addWebsite(this.config.sites[i]);
		}

		if(this.config.nodeserver.admin.active) {
			if(!this.admin) {
				this.admin = new nodeserverAdmin(self);
				this.admin.adminInterface();
			}
		} else if(this.admin) {
			this.admin.stopAdminInterface();
		}
	};



	this.addWebsite = function(site) {
		var website = new core.models.website(site);

		for(var i = 0; i < website.ports.http.length; i++) {
			this.addPort(website.ports.http[i]);
		}

		for(var i = 0; i < website.ports.https.length; i++) {
			this.addSecurePort(website.ports.https[i]);
		}

		if(website.security.certs != null) {
			this.baseCerts = website.security.certs;
		}

		this.websites.push(website);
		core.workers.start(website);
	};



	this.addPort = function(port) {
		for(var i = 0; i < this.ports.length; i++) {
			if(this.ports[i] == port) {
				return;
			}
		}

		this.ports.push(port);
	};


	this.addSecurePort = function(port) {
		for(var i = 0; i < this.securePorts.length; i++) {
			if(this.securePorts[i] == port) {
				return;
			}
		}

		this.securePorts.push(port);
	};



	this.start = function(started) {
		if(started === undefined) {
			if(this.unix) {
				core.sockets.start();
			}
		}


		var ports = this.ports.length;
		var securePorts = this.securePorts.length;

		for(var i = 0; i < ports; i++) {
			var server = require('http').createServer(core.workers.process);
			server.listen(this.ports[i]);

			this.servers.push(server);
		}


		var secureOptions = {
			SNICallback: function(domain, callback) {
				var website = self.getWebsiteFromBinding(domain, true);

				if(website) {
					var security = {
						key: fs.readFileSync(website.security.certs.key),
						cert: fs.readFileSync(website.security.certs.cert),
					};

					if(website.security.certs.ca) {
						security.ca = [];

						for (var i = website.security.certs.ca.length - 1; i >= 0; i--) {
							security.ca.push(fs.readFileSync(website.security.certs.ca[i]));
						};
					}

					callback(null, require('tls').createSecureContext(security));
				} else {
					callback(true);
				}
			},
			key: (self.baseCerts.key && fs.existsSync(self.baseCerts.key)) ? fs.readFileSync(self.baseCerts.key) : '',
			cert: (self.baseCerts.cert && fs.existsSync(self.baseCerts.cert)) ? fs.readFileSync(self.baseCerts.cert) : ''
		};

		for(var i = 0; i < securePorts; i++) {
			var server = require('https').createServer(secureOptions, core.workers.process);
			server.listen(this.securePorts[i]);
			this.servers.push(server);
		}

		this.running = true;
	};



	this.stop = function() {
		for(var i = 0; i < this.servers.length; i++) {
			this.servers[i].close();
		}
	};


	this.restart = function() {
		this.stop();
		this.start();
	};



	process.on('exit', function(code) {
		if(self.unix && self.socket) {
			self.socket.close();
		}
	});


	/*process.on('uncaughtException', function(err) {
		console.log('Error!!!!: ' + err);
		console.log(arguments);
	});*/


	process.on('SIGINT', function() {
		console.log('\nSayonara baby!!');
		process.exit(0);
	});


	this.terminal = core.terminal.process;

	this.terminal(process.argv);
};