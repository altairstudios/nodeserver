var net = require('net');



var sockets = module.exports = exports = {
	start: function() {
		var self = this;

		self.nodeserver.socket = net.createServer(function(client) {
			client.on('data', function(data) {
				if(data == 'status') {
					self.operations.status(client);
				} else if(data == 'stop') {
					self.operations.stop(client);
				} else if(data == 'reload') {
					self.operations.reload(client);
				}
			});
		});
		
		self.nodeserver.socket.listen('/tmp/nodeserver.sock');
	},
	operations: {
		stop: function() {
			sockets.nodeserver.stop();
			setTimeout(function() {
				process.exit(0);
			}, 5000);
		},
		reload: function(client) {
			this.nodeserver.hotConfig();
			client.write(new Buffer('reloaded'));
		},
		status: function(client) {
			var json = {
				websites: []
			};

			for (var i = 0; i < sockets.nodeserver.websites.length; i++) {
				var website = sockets.nodeserver.websites[i];

				var jsonWebsite = {};

				jsonWebsite.type = website.type;
				jsonWebsite.name = website.name;
				jsonWebsite.status = ((website.process) ? ((website.processStatus == 'start') ? 'start' : 'stop') : 'start');
				jsonWebsite.pid = (website.process) ? website.process.pid : null;
				jsonWebsite.usage = website.getUsage();

				json.websites.push(jsonWebsite);
			}

			client.write(new Buffer(JSON.stringify(json)));
		}
	}
};