require('colors');
var fs = require('fs');
var net = require('net');


var terminal = module.exports = exports = {
	operations: {
		start: function(params) {
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			console.log('-= Nodeserver Help =-\n'.blue);

			if(exists) {
				console.log('Nodeserver are running'.yellow);
			} else {
				console.log('start nodeserver'.yellow);

				terminal.nodeserver.readConfigFile(params[3] || '/etc/nodeserver/nodeserver.config')
				terminal.nodeserver.start();
			}
		},
		stop: function(params) {
			console.log('-= Nodeserver Help =-\n'.blue);
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			if(exists) {
				console.log('stopping server...'.grey);

				var socket = new net.Socket();
				socket.connect('/tmp/nodeserver.sock', function() {
					socket.write('stop', function() {});

					socket.on('data', function(data) {
						console.log('server stopped'.grey);
						socket.end();
					});
				});
			} else {
				console.log('No server running'.yellow)
			}
		},
		reload: function(params) {
			console.log('reload')
		},
		status: function(params) {
			console.log('-= Nodeserver Help =-\n'.blue);
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			if(exists) {
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
			} else {
				console.log('No server running'.yellow)
			}
		},
		help: function(params) {
			console.log('-= Nodeserver Help =-\n'.blue);
			console.log('* start\t\tStart server service'.gray);
			console.log('* stop\t\tStop server service'.gray);
			console.log('* reload\tReload server configuration. Stop all child process and restart its'.gray);
			console.log('* status\tShow status of all child websites'.gray);
		},
	},
	process: function(params) {
		if(params.length < 3) {
			params[2] = 'help';
		}

		var operation = params[2];

		if(terminal.operations[operation]) {
			terminal.operations[operation](params);
		} else {
			console.log('invalid operation'.red);
			terminal.operations.help(params);
		}
	}
}