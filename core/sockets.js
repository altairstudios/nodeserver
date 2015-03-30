require('colors');
var fs = require('fs');
var net = require('net');


var sockets = module.exports = exports = {
	start: function(params) {
		sockets.nodeserver.socket = net.createServer(function(client) {
			client.on('data', function(data) {
				if(data == 'status') {
					sockets.operations.status(client);
				} else if(data == 'stop') {
					sockets.operations.stop(client);
				}
			});
		});
		
		sockets.nodeserver.socket.listen('/tmp/nodeserver.sock');
	},
	operations: {
		stop: function(client) {
			process.exit(0);
		},
		status: function(client) {
			//console.log(sockets.nodeserver.websites);

			var json = {
				websites: []
			};

			for (var i = 0; i < sockets.nodeserver.websites.length; i++) {
				var website = sockets.nodeserver.websites[i];

				var jsonWebsite = {};

				jsonWebsite.type = website.type;
				jsonWebsite.name = website.name;
				jsonWebsite.status = ((website.process) ? ((website.process.running) ? 'started' : 'stopped') : 'started');

				console.log(website)

				/*if(website.type == 'cgi') {
					jsonWebsite.type = 'cgi';
				} else {
					jsonWebsite.type = 'node';
				}

				*/

				json.websites.push(jsonWebsite);
			};

			//var json = JSON.stringify(sockets.nodeserver.websites);
			//client.write(new Buffer(json));
			
			client.write(new Buffer(JSON.stringify(json)));
		},
	}
};