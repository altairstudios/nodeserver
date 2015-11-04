var urlparser = require('url');
var path = require('path');
var fs = require('fs');
var childProcess = require('child_process');



module.exports = exports = new function() {
	var self = this;
	this.nodeserver = null;
	this.proxy = null;



	this.start = function(website) {
		if(website.type == 'node') {
			this.workerNode(website);
		}
	};



	this.process = function(req, res) {
		var host = req.headers.host;
		var website = self.nodeserver.getWebsiteFromBinding(host);

		if(website == null) {
			res.statusCode = 400;
			res.end();
		} else {
			if(website.type == 'cgi') {
				self.workerCGI(req, res, website);
				return;
			}

			self.proxy.web(req, res, {
				target: website.target
			}, function(e, req, res) {
				res.statusCode = 504;
				res.end('The website not respond');
			});
		}
	};



	this.workerNode = function(website) {
		var scriptPath = '';
		var script = '';
		var port = website.port;
		
		if(website.absoluteScript === false) {
			scriptPath = process.cwd() + '/' + path.dirname(website.script);
		} else {
			scriptPath = path.dirname(website.script);
		}

		script = path.basename(website.script);

		var env = JSON.parse(JSON.stringify(process.env));
		env.PORT = port;

		var child = childProcess.spawn(process.execPath, [script], { env: env, cwd: scriptPath, stdio: 'pipe' });
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
				self.workerNode(website);
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
				self.workerNode(website);
			}
		};
	};



	this.workerCGI = function(req, res, website) {
		var host = (req.headers.host || '').split(':');
		var address = host[0];
		var port = host[1];
		var env = JSON.parse(JSON.stringify(process.env));
		var requestUrl = urlparser.parse(req.url, true);
		var pathinfo = requestUrl.pathname;

		if(pathinfo == '/') {
			pathinfo = '/index.php';
		} 

		env.DOCUMENT_ROOT = website.script;
		env.PATH_TRANSLATED = website.script;
		env.SCRIPT_FILENAME = website.script + pathinfo;
		env.GATEWAY_INTERFACE = 'CGI/1.1';
		env.SCRIPT_NAME = pathinfo;
		env.PATH_INFO = pathinfo;
		env.SERVER_NAME = address || 'unknown';
		env.SERVER_PORT = port || 80;
		env.SERVER_PROTOCOL = 'HTTP/1.1';
		env.SERVER_SOFTWARE = 'NodeServer (AltairStudios)';

		for (var header in req.headers) {
			var name = 'HTTP_' + header.toUpperCase().replace(/-/g, '_');
			env[name] = req.headers[header];
		}

		env.REQUEST_METHOD = req.method;
		env.QUERY_STRING = requestUrl.search.substring(1) || '';
		env.REMOTE_ADDR = req.connection.remoteAddress;
		env.REMOTE_PORT = req.connection.remotePort;
		
		if('content-length' in req.headers) {
			env.CONTENT_LENGTH = req.headers['content-length'];
		}
		
		if('content-type' in req.headers) {
			env.CONTENT_TYPE = req.headers['content-type'];
		}

		if('authorization' in req.headers) {
			var auth = req.headers.authorization.split(' ');
			env.AUTH_TYPE = auth[0];
		}

		var extension = path.extname(pathinfo).substring(1);
		var mimes = JSON.parse(fs.readFileSync(__dirname + '/../../configuration/mimes.json'));
		var mime = mimes.mimes[extension];

		if(mime) {
			if(mime.type == 'static') {
				fs.readFile(website.script + pathinfo, function(err, file) {
					if(err) {
						res.writeHead(500, {'Content-Type': 'text/plain'});
						res.write(err + '\n');
						res.end();
						return;
					}

					res.writeHead(200);
					res.write(file);
					res.end();

					website.writeLog(pathinfo, 'log');
				});
			} else if(mime.type == 'php') {
				var cgi = childProcess.spawn('php', ['-t', website.script, '-f', website.script + pathinfo], { env: env });
				req.pipe(cgi.stdin);
				
				cgi.stderr.on('data', function(chunk) {
					website.writeLog(chunk.toString('utf8'), 'error');
				});

				cgi.stdout.pipe(res.connection);

				cgi.on('exit', function() {
					website.writeLog(website.script, 'log');
				});
			}
		} else {
			res.writeHead(500, {'Content-Type': 'text/plain'});
			res.write('File not supported' + '\n');
			res.end();
			return;
		}
	};
};