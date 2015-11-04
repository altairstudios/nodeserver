require('colors');
var fs = require('fs');
var net = require('net');
var childProcess = require('child_process');
var crypto = require('crypto');


var terminal = module.exports = exports = {
	writeShell: function(message) {
		/*eslint-disable*/
		console.log(message);
		/*eslint-enable*/
	},
	operations: {
		start: function(params) {
			var exists = fs.existsSync('/tmp/nodeserver.sock');
			terminal.writeShell('-= Nodeserver =-\n'.blue);

			if(exists) {
				terminal.writeShell('Nodeserver are running'.yellow);
			} else {
				terminal.writeShell('start nodeserver'.yellow);

				var child = childProcess.spawn(__dirname + '/../bin/nodeserver', ['start-loop', params[3] || '/etc/nodeserver/nodeserver.config'], { detached: true, stdio: 'ignore' });
				child.unref();
			}
		},
		'start-loop': function(params) {
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			terminal.writeShell('-= Nodeserver =-\n'.blue);

			if(exists) {
				terminal.writeShell('Nodeserver are running'.yellow);
			} else {
				terminal.writeShell('start nodeserver'.yellow);

				terminal.nodeserver.readConfigFile(params[3] || '/etc/nodeserver/nodeserver.config');
				terminal.nodeserver.start();
			}
		},
		stop: function() {
			terminal.writeShell('-= Nodeserver =-\n'.blue);
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			if(exists) {
				terminal.writeShell('stopping server...'.grey);

				var socket = new net.Socket();
				socket.on('error', function(e) {
					if (e.code == 'ECONNREFUSED') {
						fs.unlinkSync('/tmp/nodeserver.sock');
					}
				});
				socket.connect('/tmp/nodeserver.sock', function() {
					socket.write('stop', function() {});

					socket.on('data', function() {
						terminal.writeShell('server stopped'.grey);
						socket.end();
					});
				});
			} else {
				terminal.writeShell('No server running'.yellow);
			}
		},
		reload: function() {
			terminal.writeShell('-= Nodeserver =-\n'.blue);
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			if(exists) {
				terminal.writeShell('stopping server...'.grey);

				var socket = new net.Socket();
				socket.on('error', function(e) {
					if (e.code == 'ECONNREFUSED') {
						fs.unlinkSync('/tmp/nodeserver.sock');
					}
				});
				socket.connect('/tmp/nodeserver.sock', function() {
					socket.write('reload', function() {});

					socket.on('data', function() {
						terminal.writeShell('Server reloaded'.grey);
						socket.end();
					});
				});
			} else {
				terminal.writeShell('No server running'.yellow);
			}
		},
		password: function(params) {
			terminal.writeShell('-= Nodeserver =-\n'.blue);

			if(!params[3]) {
				terminal.writeShell('No text for hash. Use "nodeserver password [text]"'.red);
			} else {
				terminal.writeShell('The password is:'.yellow);
				terminal.writeShell(crypto.createHash('md5').update(params[3]).digest('hex').yellow);
				terminal.writeShell('Use it on password config json file'.yellow);
			}
		},
		status: function() {
			terminal.writeShell('-= Nodeserver =-\n'.blue);
			var exists = fs.existsSync('/tmp/nodeserver.sock');

			if(exists) {
				var socket = new net.Socket();
				socket.on('error', function(e) {
					if (e.code == 'ECONNREFUSED') {
						terminal.writeShell('No server running'.yellow);
						fs.unlinkSync('/tmp/nodeserver.sock');
					}
				});

				socket.connect('/tmp/nodeserver.sock', function() {
					terminal.writeShell('Server running'.yellow);
					socket.write('status', function() {});

					socket.on('data', function(data) {
						var json = JSON.parse(data);
						socket.end();

						if(json.websites.length > 0) {
							terminal.writeShell('Monitoring\n'.gray);
							for (var i = 0; i < json.websites.length; i++) {
								var website = json.websites[i];
								var status = (website.status == 'start') ? ' ● '.green : ' ● '.red;

								var title = status + website.name.bold.green + ' (' + website.type.green + ')';

								if(website.usage) {
									title += ' - mem: ' + website.usage.size + ' MB';
								}

								terminal.writeShell(title);

								if(website.usage) {
									var textCpu = website.usage.cpu.toString().split('');
									var textMem = website.usage.mem.toString().split('');

									while(textCpu.length < 5) {
										textCpu.unshift(' ');
									}

									while(textMem.length < 5) {
										textMem.unshift(' ');
									}

									var cpuBars = [];
									var memBars = [];

									for (var j = 0; j < 20; j++) {
										if(website.usage.cpu > (j * 5)) {
											cpuBars.push('🁢');
										} else {
											cpuBars.push(' ');
										}
									}

									for (var j = 0; j < 20; j++) {
										if(website.usage.mem > (j * 5)) {
											memBars.push('🁢');
										} else {
											memBars.push(' ');
										}
									}

									terminal.writeShell('   CPU: '.grey + textCpu.join('').grey + '% ['.grey + cpuBars.join('').blue + ']'.grey);
									terminal.writeShell('   MEM: '.grey + textMem.join('').grey + '% ['.grey + memBars.join('').red + ']'.grey);
								}
							}
						} else {
							terminal.writeShell('No websites configured'.gray);
						}
					});
				});
			} else {
				terminal.writeShell('No server running'.yellow);
			}
		},
		install: function(params) {
			terminal.writeShell('-= Nodeserver =-\n'.blue);

			if(!params[3]) {
				return terminal.writeShell('No system for install. Use nodeserver install [centos]"'.red);
			}

			var daemonScript = '/etc/init.d/nodeserver';
			var script = fs.readFileSync(__dirname + '/daemons/scripts/centos.sh', {encoding: 'utf8'});

			fs.writeFileSync(daemonScript, script);

			var shell = 'chmod +x ' + daemonScript + '; chkconfig --level 345 nodeserver on';
			childProcess.exec(shell, function() {
				terminal.writeShell('Daemon script are installed'.yellow);
			});
		},
		help: function() {
			terminal.writeShell('-= Nodeserver Help =-'.blue);
			terminal.writeShell('use: nodeserver [command] [parameters]\n'.green);
			terminal.writeShell('* start\t\tStart server service in background'.gray);
			terminal.writeShell('* start-loop\t\tStart server service in loop'.gray);
			terminal.writeShell('* stop\t\tStop server service'.gray);
			terminal.writeShell('* reload\tReload server configuration. Stop all child process and restart its'.gray);
			terminal.writeShell('* status\tShow status of all child websites'.gray);
			terminal.writeShell('* password\tSend a password by param and hash it'.gray);
			terminal.writeShell('* install\tInstall script on the system. Pass the system code [centos] currently only support CentOS'.gray);
		}
	},
	process: function(params) {
		if(params.length < 3) {
			params[2] = 'help';
		}

		var operation = params[2];

		if(terminal.operations[operation]) {
			terminal.operations[operation](params);
		} else {
			terminal.writeShell('invalid operation'.red);
			terminal.operations.help(params);
		}
	}
};