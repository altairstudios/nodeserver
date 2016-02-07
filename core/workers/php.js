var urlparser = require('url');
var path = require('path');
var fs = require('fs');
var childProcess = require('child_process');



module.exports = exports = {
	start: function(website) {
	},
	request: function(req, res, website, engine) {
		var host = (req.headers.host || '').split(':');
		var address = host[0];
		var port = host[1];
		var env = JSON.parse(JSON.stringify(process.env));
		var requestUrl = urlparser.parse(req.url, true);
		var pathinfo = requestUrl.pathname;

		if(pathinfo == '/') {
			//pathinfo = '/index.php';
		} 

		env.DOCUMENT_ROOT = website.script;
		env.PATH_TRANSLATED = website.script + pathinfo;
		env.SCRIPT_FILENAME = website.script + pathinfo;
		env.REQUEST_URI = pathinfo;
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

		var filerequested = pathinfo;
		if(pathinfo == '/') {
			filerequested = '/index.php';
		}

		var extension = path.extname(filerequested).substring(1);
		var mimes = JSON.parse(fs.readFileSync(__dirname + '/../../configuration/mimes.json'));
		var mime = mimes.mimes[extension];

		if(mime) {
			if(mime.type == 'static') {
				fs.readFile(website.script + filerequested, function(err, file) {
					if(err) {
						res.writeHead(500, {'Content-Type': 'text/plain'});
						res.write(err + '\n');
						res.end();
						return;
					}

					res.writeHead(200);
					res.write(file);
					res.end();

					website.writeLog(filerequested, 'log');
				});
			} else if(mime.type == 'php') {
				var cgi = childProcess.spawn('php', ['-t', website.script, '-f', website.script + filerequested], { env: env });
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
	}
};