require('colors');
var fs = require('fs');
var net = require('net');
var childProcess = require('child_process');
var crypto = require('crypto');


var terminal = module.exports = exports = {
	operations: {
		start: function(params) {
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			console.log('-= Nodeserver =-\n'.blue);

			if(exists) {
				console.log('Nodeserver are running'.yellow);
			} else {
				console.log('start nodeserver'.yellow);

				var child = childProcess.spawn(__dirname + "/../bin/nodeserver", ["start-loop", params[3] || '/etc/nodeserver/nodeserver.config'], { detached: true, stdio: 'ignore' });
				child.unref();
			}
		},
		'start-loop': function(params) {
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			console.log('-= Nodeserver =-\n'.blue);

			if(exists) {
				console.log('Nodeserver are running'.yellow);
			} else {
				console.log('start nodeserver'.yellow);

				terminal.nodeserver.readConfigFile(params[3] || '/etc/nodeserver/nodeserver.config')
				terminal.nodeserver.start();
			}
		},
		stop: function(params) {
			console.log('-= Nodeserver =-\n'.blue);
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
			console.log('-= Nodeserver =-\n'.blue);
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			if(exists) {
				console.log('stopping server...'.grey);

				var socket = new net.Socket();
				socket.connect('/tmp/nodeserver.sock', function() {
					socket.write('reload', function() {});

					socket.on('data', function(data) {
						console.log('Server reloaded'.grey);
						socket.end();
					});
				});
			} else {
				console.log('No server running'.yellow)
			}
		},
		password: function(params) {
			console.log('-= Nodeserver =-\n'.blue);

			if(!params[3]) {
				console.log('No text for hash. Use "nodeserver password [text]"'.red);
			} else {
				console.log('The password is:'.yellow);
				console.log(crypto.createHash('md5').update(params[3]).digest('hex').yellow);
				console.log('Use it on password config json file'.yellow);
			}
		},
		status: function(params) {
			console.log('-= Nodeserver =-\n'.blue);
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			if(exists) {
				console.log('Server running'.yellow);

				var socket = new net.Socket();
				socket.connect('/tmp/nodeserver.sock', function() {
					socket.write('status', function() {});

					socket.on('data', function(data) {
						var json = JSON.parse(data);
						socket.end();

						if(json.websites.length > 0) {
							console.log('Monitoring\n'.gray);
							for (var i = 0; i < json.websites.length; i++) {
								var website = json.websites[i];
								var status = (website.status == 'start') ? ' ● '.green : ' ● '.red;

								var title = status + website.name.bold.green + ' (' + website.type.green + ')';

								if(website.usage) {
									title += ' - mem: ' + website.usage.size + ' MB';
								}

								console.log(title);

								if(website.usage) {
									var textCpu = website.usage.cpu.toString().split('');
									var textMem = website.usage.mem.toString().split('');

									while(textCpu.length < 5) {
										textCpu.unshift(' ');
									};

									while(textMem.length < 5) {
										textMem.unshift(' ');
									};

									var cpuBars = [];
									var memBars = [];

									for (var j = 0; j < 20; j++) {
										if(website.usage.cpu > (j * 5)) {
											cpuBars.push('🁢');
										} else {
											cpuBars.push(' ');
										}
									};

									for (var j = 0; j < 20; j++) {
										if(website.usage.mem > (j * 5)) {
											memBars.push('🁢');
										} else {
											memBars.push(' ');
										}
									};

									console.log('   CPU: '.grey + textCpu.join('').grey + '% ['.grey + cpuBars.join('').blue + ']'.grey);
									console.log('   MEM: '.grey + textMem.join('').grey + '% ['.grey + memBars.join('').red + ']'.grey);
								}
							};
						} else {
							console.log('No websites configured'.gray);
						}
					});
				});
			} else {
				console.log('No server running'.yellow)
			}
		},
		install: function(params) {
			console.log('-= Nodeserver =-\n'.blue);

			if(!params[3]) {
				return console.log('No system for install. Use nodeserver install [centos]"'.red);
			}

			var daemonScript = '/etc/init.d/nodeserver';
			var script = fs.readFileSync(__dirname + '/daemons/scripts/centos.sh', {encoding: 'utf8'});

			fs.writeFileSync(daemonScript, script);

			var shell = 'chmod +x ' + daemonScript + '; chkconfig --level 345 nodeserver on';
			childProcess.exec(shell, function() {
				console.log('Daemon script are installed'.yellow);
			});
		},
		help: function(params) {
			console.log('-= Nodeserver Help =-'.blue);
			console.log('use: nodeserver [command] [parameters]\n'.green);
			console.log('* start\t\tStart server service in background'.gray);
			console.log('* start-loop\t\tStart server service in loop'.gray);
			console.log('* stop\t\tStop server service'.gray);
			console.log('* reload\tReload server configuration. Stop all child process and restart its'.gray);
			console.log('* status\tShow status of all child websites'.gray);
			console.log('* password\tSend a password by param and hash it'.gray);
			console.log('* install\tInstall script on the system. Pass the system code [centos] currently only support CentOS'.gray);
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
};