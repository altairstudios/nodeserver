var crypto = require('crypto');
var urlparser = require('url');
var childProcess = require('child_process');
var path = require('path');
var fs = require('fs');



module.exports = exports = function(opts, nodeserver) {
	opts = opts || {};

	this.id = crypto.createHash('md5').update(Math.random().toString()).digest('hex');
	this.name = '';
	this.type = 'node';
	this.bindings = [];
	this.port = Math.floor(Math.random() * 65000);
	this.security = {};
	this.script = null;
	this.target = null;
	this.json = {};

	this.ports = {
		http: [],
		https: []
	};

	this.log = [];



	this.parseConfig = function(json) {
		if(typeof json === 'string') {
			this.name = json;
			json = JSON.parse(fs.readFileSync(path.dirname(nodeserver.configFile) + '/sites/' + json + '.config'));
			this.json = json;
		} else {
			this.json = json;
		}

		this.name = json.name || this.name;
		this.id = crypto.createHash('md5').update(this.name + Math.random().toString()).digest('hex');
		this.type = json.type || this.type;
		this.port = json.port || this.port;
		this.script = json.script || this.script;

		if(this.port + 20000 <= 65536) {
			this.port += 20000;
		}

		this.target = json.target || 'http://localhost:' + this.port;

		this.ports = {
			http: [],
			https: []
		};


		this.bindings = [];
		if(json.bindings && json.bindings.length > 0) {
			for (var i = 0; i < json.bindings.length; i++) {
				var url = urlparser.parse('http://' + json.bindings[i]);
				this.ports.http.push(url.port);

				this.bindings.push(json.bindings[i]);
			}
		}

		this.security = {
			certs: {
				key: null,
				cert: null,
				ca: []
			},
			bindings: []
		};

		if(json.security) {
			if(json.security.certs) {
				if(json.security.certs.key) {
					this.security.certs.key = json.security.certs.key;
				}

				if(json.security.certs.cert) {
					this.security.certs.cert = json.security.certs.cert;
				}

				if(json.security.certs.ca && json.security.certs.ca.length > 0) {
					for (var i = 0; i < json.security.certs.ca.length; i++) {
						this.security.certs.ca.push(json.security.certs.ca[i]);
					}
				}
			}

			if(json.security.bindings && json.security.bindings.length > 0) {
				for (var i = 0; i < json.security.bindings.length; i++) {
					var url = urlparser.parse('https://' + json.security.bindings[i]);
					this.ports.https.push(url.port);

					this.security.bindings.push(json.security.bindings[i]);
				}
			}


			if(json.security.custom && json.security.custom.length > 0) {
				for (var i = 0; i < json.security.custom.length; i++) {
					if(json.security.custom[i].bindings && json.security.custom[i].bindings.length > 0) {
						for (var j = 0; j < json.security.custom[i].bindings.length; j++) {
							var url = urlparser.parse('https://' + json.security.custom[i].bindings[j]);
							this.ports.https.push(url.port);
							this.security.bindings.push(json.security.custom[i].bindings[j]);
						}
					}
				}
			}
		}
	};



	this.writeLog = function(message, type) {
		this.log.unshift({
			date: new Date(),
			type: type,
			message: message
		});

		if(this.log.length > 100) {
			this.log.pop();
		}
	};



	this.getUsage = function() {
		if(!this.process) {
			return;
		}

		try {
			var usage = childProcess.execSync('ps -p ' + this.process.pid + ' -o %cpu=,%mem=,rss=').toString('utf8');
			var mathUsage = usage.replace(/,/g, '.');
			var cpu = parseFloat(mathUsage.substr(0, 5));
			var mem = parseFloat(mathUsage.substr(5, 5));
			var size = Math.round((parseFloat(mathUsage.substr(10)) / 1024) * 100) / 100;

			return {
				pid: this.pid,
				cpu: cpu,
				mem: mem,
				size: size
			};
		} catch(ex) {
			return;
		}
	};



	this.getSecurity = function(domain) {
		var security = {
			key: fs.readFileSync(this.security.certs.key),
			cert: fs.readFileSync(this.security.certs.cert)
		};

		if(this.json.security.custom && this.json.security.custom.length > 0) {
			for (var i = 0; i < this.json.security.custom.length; i++) {
				if(this.json.security.custom[i].bindings && this.json.security.custom[i].bindings.length > 0) {
					for (var j = 0; j < this.json.security.custom[i].bindings.length; j++) {
						if(this.json.security.custom[i].bindings[j] == domain) {
							return {
								key: fs.readFileSync(this.json.security.custom[i].certs.key),
								cert: fs.readFileSync(this.json.security.custom[i].certs.cert)
							};
						}
					}
				}
			}
		}

		return security;
	};



	this.parseConfig(opts);
};