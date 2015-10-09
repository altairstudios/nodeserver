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
				} else if(data == 'reload') {
					sockets.operations.reload(client);
				}
			});
		});
		
		sockets.nodeserver.socket.listen('/tmp/nodeserver.sock');
	},
	operations: {
		stop: function(client) {
			process.exit(0);
		},
		reload: function(client) {
			sockets.nodeserver.hotConfig();
			client.write(new Buffer('reloaded'));
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

				json.websites.push(jsonWebsite);
			};

			client.write(new Buffer(JSON.stringify(json)));
		},
	}
};