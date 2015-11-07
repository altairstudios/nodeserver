var express = require('express');
var routes = require('./routes');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');



module.exports = exports = function(nodeserver) {
	var admin = this;
	this.app = express();
	this.routes = routes;
	this.config = nodeserver.config;
	this.nodeserver = nodeserver;
	this.loginErros = {};
	this.server = null;



	this.configureExpress = function() {
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(bodyParser.json());

		this.app.use(cookieParser());
		this.app.use(session({ secret: require('crypto').createHash('sha1').digest('base64'), resave: true, saveUninitialized: true }));
		this.app.use('/', express.static(__dirname + '/public'));

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
		this.app.locals.version = this.nodeserver.getVersion();
	};



	this.configureRoutes = function() {
		this.app.get('/', this.routes.home);

		this.app.all('/login', this.routes.login);
		this.app.get('/logout', this.routes.logout);

		this.app.get('/websites/:websiteId', this.routes.website);
		this.app.get('/websites/:websiteId/start', this.routes.websiteStart);
		this.app.get('/websites/:websiteId/restart', this.routes.websiteRestart);
		this.app.get('/websites/:websiteId/stop', this.routes.websiteStop);

		this.app.get('/config/refresh', this.routes.config.refresh);
	};



	this.adminInterface = function() {
		this.server = this.app.listen(this.config.port || 10000).on('error', function() {
			admin.server.close();
		});
	};



	this.stopAdminInterface = function() {
		try {
			this.server.close();
		} catch(ex) {}
	};



	this.configureExpress();
	this.configureRoutes();
};