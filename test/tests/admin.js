var assert = require('assert');
var http = require('http');
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
};