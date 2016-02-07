var path = require('path');
var fs = require('fs');
var childProcess = require('child_process');



/**
 * Object to manage website type for nodejs
 * @type {Object}
 */
module.exports = exports = {
	/**
	 * Start the nodejs process. Spawn the proccess and listen on a port
	 * @param  {Website} website Website to start
	 */
	start: function(website) {
		var self = this;
		var scriptPath = path.dirname(website.script);
		var script = '';
		var port = website.port;
		
		if(website.absoluteScript === false) {
			scriptPath = process.cwd() + '/' + path.dirname(website.script);
		}

		script = path.basename(website.script);

		var env = JSON.parse(JSON.stringify(process.env));
		env.PORT = port;

		var spawnOptions = {
			env: env,
			cwd: scriptPath,
			stdio: 'pipe',
			detached: false
		};

		var child = childProcess.spawn(process.execPath, [script], spawnOptions);
		website.process = child;
		website.processStatus = 'start';


		child.stderr.on('data', function(chunk) {
			website.writeLog(chunk.toString('utf8'), 'error');
		});

		child.stdout.on('data', function(chunk) {
			website.writeLog(chunk.toString('utf8'), 'log');
		});

		child.on('exit', function(code, signal) {
			website.writeLog('cgi spawn ' + child.pid + ' "exit" event (code ' + code + ') (signal ' + signal + ') (status ' + website.processStatus + ')', 'log');

			if(website.processStatus == 'stop') {
				website.processStatus = 'end';
			} else {
				website.processStatus = 'end';
				self.start(website);
			}
		});

		website.operations = {
			stop: function() {
				website.processStatus = 'stop';
				child.kill('SIGINT');
			},
			reboot: function() {
				website.processStatus = 'stop';
				child.kill('SIGINT');
				website.operations.stop();
				website.operations.start();
			},
			start: function() {
				self.start(website);
			}
		};
	},
	request: function(req, res, website, engine) {
		engine.proxy.web(req, res, {
			target: website.target
		}, function(e, req, res) {
			res.statusCode = 504;
			res.end('The website not respond');
		});
	}
};