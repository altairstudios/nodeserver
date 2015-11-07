var assert = require('assert');
var http = require('http');
var querystring = require('querystring');
var nodeserverClass = require('../../nodeserver');


module.exports = exports = {
	configEmpty: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {}
			}
		});

		nodeserver.start();

		var serverStatus = function(status) {
			assert(status, 'The administrator should not be active');
			nodeserver.exit();
			done();
		};

		http.get('http://localhost:10000', function(res) {
			console.log(res)
			serverStatus(false);
		}).on('error', function(e) {
			serverStatus(true);
		});
	},
	onlyActiveFalse: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {
					active: false
				}
			}
		});

		nodeserver.start();

		var serverStatus = function(status) {
			nodeserver.exit();
			assert(status, 'The administrator should not be active');
			done();
		};

		http.get('http://localhost:10000', function(res) {
			serverStatus(false);
		}).on('error', function(e) {
			serverStatus(true);
		});
	},
	onlyActiveTrue: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {
					active: true
				}
			}
		});

		nodeserver.start();

		var serverStatus = function(status) {
			nodeserver.exit();
			assert(status, 'The administrator should be active on port 10000');
			done();
		};

		http.get('http://localhost:10000', function(res) {
			serverStatus(true);
		}).on('error', function(e) {
			serverStatus(false);
		});
	},
	onlyActiveTrueAccess: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {
					active: true
				}
			}
		});

		nodeserver.start();

		var serverStatus = function(status, message) {
			message = message || 'The administrator should be active on port 10000';
			nodeserver.exit();
			assert(status, message);
			done();
		};

		var postData = querystring.stringify({
			user: '',
			password: ''
		});

		var options = {
			hostname: 'localhost',
			port: 10000,
			path: '/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			}
		};

		var req = http.request(options, function(res) {
			if(res.headers.location == '/') {
				serverStatus(false, 'The admin should not be logged');
			} else {
				serverStatus(true);
			}
		}).on('error', function(e) {
			serverStatus(false);
		});

		req.write(postData);
		req.end();
	},
	onlyUserVoidAccess: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {
					active: true,
					user: ''
				}
			}
		});

		nodeserver.start();

		var serverStatus = function(status, message) {
			message = message || 'The administrator should be active on port 10000';
			nodeserver.exit();
			assert(status, message);
			done();
		};

		var postData = querystring.stringify({
			user: '',
			password: ''
		});

		var options = {
			hostname: 'localhost',
			port: 10000,
			path: '/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			}
		};

		var req = http.request(options, function(res) {
			if(res.headers.location == '/') {
				serverStatus(false, 'The admin should not be logged');
			} else {
				serverStatus(true);
			}
		}).on('error', function(e) {
			serverStatus(false);
		});

		req.write(postData);
		req.end();
	},
	onlyPasswordVoidAccess: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {
					active: true,
					password: ''
				}
			}
		});

		nodeserver.start();

		var serverStatus = function(status, message) {
			message = message || 'The administrator should be active on port 10000';
			nodeserver.exit();
			assert(status, message);
			done();
		};

		var postData = querystring.stringify({
			user: '',
			password: ''
		});

		var options = {
			hostname: 'localhost',
			port: 10000,
			path: '/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			}
		};

		var req = http.request(options, function(res) {
			if(res.headers.location == '/') {
				serverStatus(false, 'The admin should not be logged');
			} else {
				serverStatus(true);
			}
		}).on('error', function(e) {
			serverStatus(false);
		});

		req.write(postData);
		req.end();
	},
	userPasswordVoidAccess: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {
					active: true,
					user: '',
					password: ''
				}
			}
		});

		nodeserver.start();

		var serverStatus = function(status, message) {
			message = message || 'The administrator should be active on port 10000';
			nodeserver.exit();
			assert(status, message);
			done();
		};

		var postData = querystring.stringify({
			user: '',
			password: ''
		});

		var options = {
			hostname: 'localhost',
			port: 10000,
			path: '/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			}
		};

		var req = http.request(options, function(res) {
			if(res.headers.location == '/') {
				serverStatus(false, 'The admin should not be logged');
			} else {
				serverStatus(true);
			}
		}).on('error', function(e) {
			serverStatus(false);
		});

		req.write(postData);
		req.end();
	},
	invalidPassword: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {
					active: true,
					user: 'nodeserver',
					password: 'e854d7282f1e5a842e712eea4dfbdaf5'
				}
			}
		});

		nodeserver.start();

		var serverStatus = function(status, message) {
			message = message || 'The administrator should be active on port 10000';
			nodeserver.exit();
			assert(status, message);
			done();
		};

		var postData = querystring.stringify({
			user: 'nodeserver',
			password: 'nodeserver-error'
		});

		var options = {
			hostname: 'localhost',
			port: 10000,
			path: '/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			}
		};

		var req = http.request(options, function(res) {
			if(res.headers.location == '/') {
				serverStatus(false, 'The admin should not be logged');
			} else {
				serverStatus(true);
			}
		}).on('error', function(e) {
			serverStatus(false);
		});

		req.write(postData);
		req.end();
	},
	usedPort: function(done) {
		var server = http.createServer(function (request, response) {
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.end("Oh no, other proccess uses this port\n");
		});

		server.listen(10000);

		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {
					active: true,
					user: 'nodeserver',
					password: 'e854d7282f1e5a842e712eea4dfbdaf5',
					port: 10000
				}
			}
		});

		nodeserver.start();
		nodeserver.exit();
		server.close();
		done();
	},
	allOkButDesactivate: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {
					active: false,
					user: 'nodeserver',
					password: 'e854d7282f1e5a842e712eea4dfbdaf5',
					port: 10000
				}
			}
		});

		nodeserver.start();

		var serverStatus = function(status) {
			nodeserver.exit();
			assert(status, 'The administrator should not be active');
			done();
		};

		http.get('http://localhost:10000', function(res) {
			serverStatus(false);
		}).on('error', function(e) {
			serverStatus(true);
		});
	}
};