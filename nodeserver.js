var httpProxy = require('http-proxy');
var http = require('http');
var https = require('https');
var agent = new http.Agent({ maxSockets: Number.MAX_VALUE });
var proxy = httpProxy.createProxy({ xfwd: true, agent: agent });
var fs = require('fs');
var nodeserverAdmin = require('./admin');
var os = require('os');
require('colors');
var core = require('./core');
var crypto = require('crypto');
var tls = require('tls');
var path = require('path');



module.exports = exports = function(inTerminal) {
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



	/**
	 * Stop all process of server, read again the configuration file and restart the server
	 * @return {null}
	 */
	this.hotConfig = function() {
		this.stop();
		this.readConfigFile(this.configFile);
		this.start(false);
	};



	/**
	 * Get version number of nodeserver
	 * @return {string}
	 */
	this.getVersion = function() {
		return require('./package.json').version;
	};



	this.getWebsiteFromBinding = function(url, onlySecure, ignorePort) {
		onlySecure = onlySecure || false;
		ignorePort = ignorePort || false;



		var containBinding = function(url, bindings, hasRegex) {
			var bindingsCount = bindings.length;

			for(var i = 0; i < bindingsCount; i++) {
				var binding = bindings[i];

				if(hasRegex) {
					var regex = new RegExp('^' + binding + '$', 'gi');
					
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
		};


		var thewebsite = getWebsite(url, self.websites);

		if(thewebsite == null) thewebsite = getWebsite(url + ':80', self.websites);
		if(thewebsite == null) thewebsite = getWebsite(url + ':443', self.websites);
		
		if(thewebsite) {
			return thewebsite;
		}

		for (var i = self.securePorts.length - 1; i >= 0; i--) {
			var secureWebsite = getWebsite(url + ':' + self.securePorts[i], self.websites);
			if(secureWebsite != null) {
				return secureWebsite;
			}
		}

		return thewebsite;
	};



	this.readConfigFile = function(configFile) {
		configFile = configFile || 'nodeserver.config';
		var config = null;

		if(!path.isAbsolute(configFile)) {
			configFile = path.resolve(process.cwd(), configFile);
		}

		if(fs.existsSync(configFile)) {
			this.configFile = configFile;
			config = fs.readFileSync(configFile);
		} else if(fs.existsSync(__dirname + configFile)) {
			this.configFile = __dirname + configFile;
			config = fs.readFileSync(__dirname + configFile);
		}  else if(fs.existsSync(__dirname + '/' + configFile)) {
			this.configFile = __dirname + '/' + configFile;
			config = fs.readFileSync(__dirname + '/' + configFile);
		} else if(fs.existsSync('/etc/nodeserver/nodeserver.config')) {
			this.configFile = '/etc/nodeserver/nodeserver.config';
			config = fs.readFileSync('/etc/nodeserver/nodeserver.config');
		}

		var json = JSON.parse(config);

		this.readConfig(json);
	};



	this.readConfig = function(config) {
		this.config = config;

		if(this.config == null) {
			return;
		}

		this.websites = [];

		if(this.config.sites && Array.isArray(this.config.sites)) {
			for(var i = 0; i < this.config.sites.length; i++) {
				this.addWebsite(this.config.sites[i]);
			}	
		}
		

		if(this.config.nodeserver && this.config.nodeserver.admin) {
			if(this.config.nodeserver.admin.active) {
				if(!this.admin) {
					this.admin = new nodeserverAdmin(self);
					this.admin.adminInterface();
				}
			} else if(this.admin) {
				this.admin.stopAdminInterface();
			}	
		}
	};



	this.addWebsite = function(site) {
		var website = new core.models.website(site, this);

		for(var i = 0; i < website.ports.http.length; i++) {
			this.addPort(website.ports.http[i]);
		}

		for(var i = 0; i < website.ports.https.length; i++) {
			this.addSecurePort(website.ports.https[i]);
		}

		if(website.security.certs != null && website.security.certs != undefined && website.security.certs.key != null) {
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
			var server = http.createServer(core.workers.process);
			server.listen(this.ports[i]);

			this.servers.push(server);
		}


		var secureOptions = {
			SNICallback: function(domain, callback) {
				var website = self.getWebsiteFromBinding(domain, true, true);

				if(website) {
					var security = website.getSecurity(domain);
					/*{
						key: fs.readFileSync(website.security.certs.key),
						cert: fs.readFileSync(website.security.certs.cert)
					};*/

					if(website.security.certs.ca) {
						security.ca = [];

						for (var i = website.security.certs.ca.length - 1; i >= 0; i--) {
							security.ca.push(fs.readFileSync(website.security.certs.ca[i]));
						}
					}

					if(callback) {
						callback(null, tls.createSecureContext(security));
					} else {
						try {
							return tls.createSecureContext(security);
						} catch(e) {
							return crypto.createCredentials(security).context;
						}
					}
				} else {
					if(callback) {
						callback(true);
					} else {
						return true;
					}
				}
			},
			key: (self.baseCerts.key && fs.existsSync(self.baseCerts.key)) ? fs.readFileSync(self.baseCerts.key) : '',
			cert: (self.baseCerts.cert && fs.existsSync(self.baseCerts.cert)) ? fs.readFileSync(self.baseCerts.cert) : ''
		};

		for(var i = 0; i < securePorts; i++) {
			var server = https.createServer(secureOptions, core.workers.process);
			server.listen(this.securePorts[i]);
			this.servers.push(server);
		}

		this.running = true;
	};



	this.stop = function() {
		for(var i = 0; i < this.websites.length; i++) {
			if(this.websites[i].operations) {
				this.websites[i].operations.stop();
			}
		}

		for(var i = 0; i < this.servers.length; i++) {
			this.servers[i].close();
		}
	};


	this.restart = function() {
		this.stop();
		this.start();
	};



	this.exit = function() {
		this.stop();

		if(this.admin) {
			this.admin.stopAdminInterface();
		}

		if(self.unix && self.socket) {
			try {
				self.socket.close();
			} catch(ex) {}
		}
	};



	//process.setMaxListeners(100);



	process.on('exit', function() {
		self.exit();
	});




	/*process.on('uncaughtException', function(err) {
		/*eslint-disable*-/
		console.error('Nodeserver Error ' + err);
		console.error(arguments);
		/*eslint-enable*-/
	});*/


	process.on('SIGINT', function() {
		/*eslint-disable*/
		console.log('\nSayonara baby!!');
		/*eslint-enable*/
		process.exit(0);
	});


	this.terminal = core.terminal.process;

	if(inTerminal) {
		this.terminal(process.argv);
	}

	return self;
};