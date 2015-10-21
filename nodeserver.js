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
					var regex = new RegExp("^" + url + ":", "gi")
					
					if(regex.test(binding)) {
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
			var site = this.config.sites[i];

			site.id = crypto.createHash('md5').update(site.name + site.bindings[0]).digest('hex');
			this.addWebsite(site);
		}

		if(this.config.nodeserver.admin.active) {
			if(!this.admin) {
				this.admin = new nodeserverAdmin(self);
				this.admin.adminInterface();
			}
		} else if(this.admin) {
			this.admin.stopAdminInterface();
		}
	}


	this.addWebsite = function(website) {
		console.log("add url: ".grey + website.name.blue);

		if(website.type == "node") {
			this.startChild(website);
		}

		for(var i = 0; i < website.bindings.length; i++) {
			var url = urlparser.parse("http://" + website.bindings[i]);

			this.addPort(url.port);
		}

		if(website.security) {
			for(var i = 0; i < website.security.bindings.length; i++) {
				var url = urlparser.parse("https://" + website.security.bindings[i]);
				this.addSecurePort(url.port);
			}

			if(website.security.certs) {
				this.baseCerts = website.security.certs;
			}
		}

		website.port = website.port || (Math.floor(Math.random() * 65000));
		if(website.port + 20000 <= 65536) {
			website.port += 20000;
		}

		website.target = website.target || "http://localhost:" + website.port;

		this.websites.push(website);
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


	this.startChild = function(website) {
		var scriptPath = "";
		var script = "";
		var port = website.port;
		var sslport = website.portssl || port + 11000;

		if(website.absoluteScript === false) {
			scriptPath = process.cwd() + "/" + path.dirname(website.script);
		} else {
			scriptPath = path.dirname(website.script);
		}

		script = path.basename(website.script);

		console.log("SCRIPT: " + script);
		console.log("PATH: " + scriptPath);
		console.log("PORT: " + port);

		var childConfig = {
			spinSleepTime: 10000,
			max: 10,
			silent: false,
			options: [],
			sourceDir: scriptPath,
			cwd: scriptPath,
			env: { 'PORT': port }
		};

		var child = new (forever.Monitor)(script, childConfig);

		child.on('exit', function (forever) {
			console.log('Closing script ' + forever.args[0]);
		});

		website.log = [];

		if(fs.existsSync(website.script)) {
			child.start();
		}

		if(child.child != null) {
			child.child.stdout.on('data', function (data) {
				var buff = new Buffer(data);
				var lines = buff.toString('utf8').split(/(\r?\n)/g);
				//console.log("foo: " + buff.toString('utf8'));
				for (var i=0; i<lines.length; i++) {
					// Process the line, noting it might be incomplete.
					//console.log('###: ' + i + ' - ' + lines[i]);
				}
			});
		}

		var watchFucntion = function (curr, prev) {
			child.stop();
			
			setTimeout(function() {
				child.start();
			}, 1000);
		};
		
		fs.watchFile(scriptPath + '/' + script, watchFucntion);
		//fs.watchFile(scriptPath + '/package.json', watchFucntion);

		website.process = child;

		return website;
	}


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