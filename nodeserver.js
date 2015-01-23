var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxy();
var urlparser = require('url');
var fs = require('fs');
var forever = require('forever-monitor');
var path = require('path');
var nodeserverAdmin = require('./admin');
var childProcess = require('child_process');
var os = require('os');
var net = require('net');
require('colors');

module.exports = exports = new function() {
	var self = this;
	this.websites = [];
	this.ports = [];
	this.servers = [];
	this.config = null;
	this.unix = (os.platform() == 'darwin' || os.platform() == 'linux');
	this.running = false;
	this.socket = null;
	//this.admin = nodeserverAdmin;
	//this.app = express();


	this.serverWorker = function(req, res) {
		var host = req.headers.host;
		var website = self.getWebsiteFromUrl(host);

		if(website == null) {
			website = self.getWebsiteFromUrl(host + ":80");
		}

		if(website == null) {
			res.end();
			return;
		}

		if(website.type == "cgi") {
			self.workerCGI(req, res, website);
			return;
		}

		proxy.web(req, res, {
			target: website.target
		}, function(e) {
			console.log(e);
		});
	};


	this.workerCGI = function(req, res, website) {
		var host = (req.headers.host || '').split(':');
		var address = host[0];
		var port = host[1];
		var env = JSON.parse(JSON.stringify(process.env));
		var requestUrl = url.parse(req.url, true);
		var pathinfo = requestUrl.pathname;

		if(pathinfo == "/") {
			pathinfo = "/index.php";
		} 

		env.DOCUMENT_ROOT = website.script;
		env.PATH_TRANSLATED = website.script;
		env.SCRIPT_FILENAME = website.script + pathinfo;
		env.GATEWAY_INTERFACE = "CGI/1.1";
		env.SCRIPT_NAME = pathinfo;
		env.PATH_INFO = pathinfo;
		env.SERVER_NAME = address || 'unknown';
		env.SERVER_PORT = port || 80;
		env.SERVER_PROTOCOL = "HTTP/1.1";
		env.SERVER_SOFTWARE = "NodeServer (AltairStudios)";

		for (var header in req.headers) {
			var name = 'HTTP_' + header.toUpperCase().replace(/-/g, '_');
			env[name] = req.headers[header];
		}

		env.REQUEST_METHOD = req.method;
		env.QUERY_STRING = requestUrl.search.substring(1) || '';
		env.REMOTE_ADDR = req.connection.remoteAddress;
		env.REMOTE_PORT = req.connection.remotePort;
		
		if('content-length' in req.headers) {
			env.CONTENT_LENGTH = req.headers['content-length'];
		}
		
		if('content-type' in req.headers) {
			env.CONTENT_TYPE = req.headers['content-type'];
		}

		if('authorization' in req.headers) {
			var auth = req.headers.authorization.split(' ');
			env.AUTH_TYPE = auth[0];
		}

		console.log(env);

		var extension = path.extname(pathinfo).substring(1);
		var mimes = JSON.parse(fs.readFileSync(__dirname + "/configuration/mimes.json"));
		var mime = mimes.mimes[extension];

		if(mime) {
			if(mime.type == "static") {
				fs.readFile(website.script + pathinfo, function(err, file) {
					if(err) {
						res.writeHead(500, {"Content-Type": "text/plain"});
						res.write(err + "\n");
						res.end();
						return;
					}

					res.writeHead(200);
					res.write(file);
					res.end();
				});
			} else if(mime.type == "php") {
				var cgi = childProcess.spawn("php", ["-t", website.script, "-f", website.script + pathinfo], { env: env });
				req.pipe(cgi.stdin);
				
				cgi.stderr.on('data', function(chunk) {
					console.log(chunk);
				});

				cgi.stdout.pipe(res.connection);

				cgi.on('exit', function(code, signal) {
					console.log('cgi spawn %d "exit" event (code %s) (signal %s)', cgi.pid, code, signal);
				});
			}
		} else {
			res.writeHead(500, {"Content-Type": "text/plain"});
			res.write("File not supported" + "\n");
			res.end();
			return;
		}
	};


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

		//double check with regex
		for(var i = 0; i < websitesCount; i++) {
			var website = this.websites[i];
			var bindingsCount = website.bindings.length;

			for(var j = 0; j < bindingsCount; j++) {
				var regex = new RegExp("^" + website.bindings[j] + "$", "gi")
				
				if(regex.test(url)) {
					return website;
				}
			}
		}
	}


	this.readConfigFile = function(configFile) {
		configFile = configFile || "nodeserver.config";
		var config = null;

		if(fs.existsSync(configFile)) {
			config = fs.readFileSync(configFile);
		} else if(fs.existsSync(__dirname + configFile)) {
			config = fs.readFileSync(__dirname + configFile);
		}  else if(fs.existsSync(__dirname + "/" + configFile)) {
			config = fs.readFileSync(__dirname + "/" + configFile);
		} else if(fs.existsSync("/etc/nodeserver/nodeserver.config")) {
			config = fs.readFileSync("/etc/nodeserver/nodeserver.config");
		}

		this.config = JSON.parse(config);

		for(var i = 0; i < this.config.sites.length; i++) {
			var site = this.config.sites[i];

			site.id = site.id || site.bindings[0];
			this.addWebsite(site);
		}

		if(this.config.nodeserver.admin.active) {
			this.admin = new nodeserverAdmin(self);
			this.admin.adminInterface();
		}
	}


	this.addWebsite = function(website) {
		console.log("add url: ".grey + website.name.blue);

		if(website.type == "node") {
			this.startChild(website);
		}

		for(var i = 0; i < website.bindings.length; i++) {
			url = urlparser.parse("http://" + website.bindings[i]);

			this.addPort(url.port);
		}

		website.port = website.port || (Math.floor(Math.random() * 65000) + 20000);
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


	this.startChild = function(website) {
		var scriptPath = "";
		var script = "";
		var port = website.port;

		if(website.absoluteScript) {
			scriptPath = path.dirname(website.script);
		} else {
			scriptPath = process.cwd() + "/" + path.dirname(website.script);
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

		//console.log(child);

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
		fs.watchFile(scriptPath + '/package.json', watchFucntion);

		website.process = child;

		return website;
	}


	this.start = function() {
		if(this.unix) {
			self.socket = net.createServer(function(client) {
				client.on('data', function(data) {
					if(data == 'status') {
						var json = JSON.stringify(self.websites);
						client.write(new Buffer(json));
					} else if(data == 'stop') {
						process.exit(0);
					}
				});
			});
			
			self.socket.listen('/tmp/nodeserver.sock');
		}

		var ports = this.ports.length;

		for(var i = 0; i < ports; i++) {
			var server = require('http').createServer(this.serverWorker);
			server.listen(this.ports[i]);

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

/*
	process.on('uncaughtException', function(err) {
		console.log('Error!!!!: ' + err);
		console.log(arguments);
	});
*/

	process.on('SIGINT', function() {
		console.log('\nSayonara baby!!');
		process.exit(0);
	});



	this.terminal = function(params) {
		if(params[2] == 'start') {
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			if(exists) {
				console.log('server are running');
			} else {
				console.log('start server');

				//exec with childprocess detached
				self.readConfigFile(params[3] || '/etc/nodeserver/nodeserver.config')
				self.start();
			}
		} else if(params[2] == 'reload') {
			/*var exists = fs.existsSync('/tmp/nodeserver.sock');

			if(exists) {
				console.log('server are running');

				
			} else {
				console.log('start server');

				//self.readConfigFile(params[3] || '/etc/nodeserver/nodeserver.config')
				self.start();
			}*/
			//TODO
		} else if(params[2] == 'stop') {
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			if(exists) {
				console.log('stopping server');

				var socket = new net.Socket();
				socket.connect('/tmp/nodeserver.sock', function() {
					socket.write('stop', function() {});

					socket.on('data', function(data) {
						console.log('server stopped');
						socket.end();
					});
				});
			} else {
				console.log('no server running')
			}
		} else if(params[2] == 'status') {
			var socket = new net.Socket();
			socket.connect('/tmp/nodeserver.sock', function() {
				socket.write('status', function() {
					console.log(arguments);
					console.log('---')
				});

				socket.on('data', function(data) {
					console.log(data.toString());
					socket.end();
				});
			});
		}
	}

	this.terminal(process.argv);
};