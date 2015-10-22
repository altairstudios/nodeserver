var crypto = require('crypto');
var urlparser = require('url');



module.exports = exports = function(opts) {
	opts = opts || {};

	this.id = crypto.createHash('md5').update(Math.random().toString()).digest('hex');
	this.name = '';
	this.type = 'node';
	this.bindings = [];
	this.port = Math.floor(Math.random() * 65000);
	this.security = {};
	this.script = null;
	this.target = null;

	this.ports = {
		http: [],
		https: []
	};

	this.log = [];



	this.parseConfig = function(json) {
		this.name = json.name || this.name;
		this.id = crypto.createHash('md5').update(this.name + Math.random().toString()).digest('hex');
		this.type = json.type || this.type;
		this.port = json.port || this.port;
		this.script = json.script || this.script;

		if(this.port + 20000 <= 65536) {
			this.port += 20000;
		}

		this.target = json.target || "http://localhost:" + this.port;

		this.ports = {
			http: [],
			https: []
		};


		this.bindings = [];
		if(json.bindings && json.bindings.length > 0) {
			for (var i = 0; i < json.bindings.length; i++) {
				var url = urlparser.parse("http://" + json.bindings[i]);
				this.ports.http.push(url.port);

				this.bindings.push(json.bindings[i]);
			};
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
					};
				}
			}

			if(json.security.bindings && json.security.bindings.length > 0) {
				for (var i = 0; i < json.security.bindings.length; i++) {
					var url = urlparser.parse("https://" + json.security.bindings[i]);
					this.ports.https.push(url.port);

					this.security.bindings.push(json.security.bindings[i]);
				};
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



	this.parseConfig(opts);
};