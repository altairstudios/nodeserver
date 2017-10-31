var assert = require('assert');
var Client = require('node-rest-client').Client;
var querystring = require('querystring');
var nodeserverClass = require('../../nodeserver');


module.exports = exports = {
	indexResponse: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {}
			},
			sites: [{
				name: 'CDN Site',
				type: 'cdn',
				bindings: [
					'localhost:3000'
				],
				script: __dirname + '/../webs/cdn'
			}]
		});

		nodeserver.start();


		var serverStatus = function(status) {
			assert(status, 'The index content not correct');
			nodeserver.exit();
			done();
		};


		
		var client = new Client();
		client.get('http://localhost:3000', function (data, response) {
			if(data == 'index-html-ok') {
				serverStatus(true);
			} else {
				serverStatus(false);
			}
		});
	},
	htmlIndexResponse: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {}
			},
			sites: [{
				name: 'CDN Site',
				type: 'cdn',
				bindings: [
					'localhost:3000'
				],
				script: __dirname + '/../webs/cdn'
			}]
		});

		nodeserver.start();


		var serverStatus = function(status) {
			assert(status, 'The index content not correct');
			nodeserver.exit();
			done();
		};


		
		var client = new Client();
		client.get('http://localhost:3000/index.html', function (data, response) {
			if(data == 'index-html-ok') {
				serverStatus(true);
			} else {
				serverStatus(false);
			}
		});
	},
	htmIndexResponse: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({
			nodeserver: {
				admin: {}
			},
			sites: [{
				name: 'CDN Site',
				type: 'cdn',
				bindings: [
					'localhost:3000'
				],
				script: __dirname + '/../webs/cdn'
			}]
		});

		nodeserver.start();


		var serverStatus = function(status) {
			assert(status, 'The index content not correct');
			nodeserver.exit();
			done();
		};


		
		var client = new Client();
		client.get('http://localhost:3000/index.htm', function (data, response) {
			if(data == 'index-htm-ok') {
				serverStatus(true);
			} else {
				serverStatus(false);
			}
		});
	}
};