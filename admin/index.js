var express = require('express');
var routes = require('./routes');
var jade = require("jade");


module.exports = exports = function(nodeserver) {
	var admin = this;
	this.app = express();
	this.routes = routes;
	this.config = nodeserver.config;
	this.nodeserver = nodeserver;
	this.loginErros = {};

	//console.log(this.config);


	this.configureExpress = function() {
		this.app.use(express.bodyParser());
		this.app.use(express.cookieParser());
		this.app.use(express.session({ secret: require('crypto').createHash('sha1').digest('base64') }));
		this.app.use('/', express.static(__dirname + '/public'));
		this.app.use(express.compress());
		this.app.use(express.logger('dev'));
		this.app.use(express.methodOverride());

		this.app.use(function(req, res, next) {
			req.config = admin.config;
			req.nodeserver = admin.nodeserver;
			req.admin = admin;

			next();
		});

		this.app.use(function(req, res, next) {
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

			if(admin.loginErros[ip]) {
				if(admin.loginErros[ip].block != null && admin.loginErros[ip].block.getTime() > new Date().getTime()) {
					res.status(403).end('Banned');
				} else {
					next();
				}
			} else {
				next();
			}
		});

		this.app.set('views', __dirname + '/views');
		this.app.set('view engine', 'jade');

		this.app.locals.pretty = true;
	};


	this.configureRoutes = function() {
		this.app.get('/', this.routes.home);

		this.app.all('/login', this.routes.login);
		this.app.get('/logout', this.routes.logout);

		this.app.get('/websites/:webisteId', this.routes.website);
		this.app.get('/websites/:webisteId/start', this.routes.websiteStart);
		this.app.get('/websites/:webisteId/restart', this.routes.websiteRestart);
		this.app.get('/websites/:webisteId/stop', this.routes.websiteStop);

		this.app.get('/config/refresh', this.routes.config.refresh);
	};


	this.adminInterface = function() {
		var self = this;

		this.app.listen(this.config.port || 10000);
	};


	this.configureExpress();
	this.configureRoutes();
}