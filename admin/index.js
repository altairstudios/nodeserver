var express = require('express');
var routes = require('./routes');
var jade = require("jade");


module.exports = exports = function(nodeserver) {
	var admin = this;
	this.app = express();
	this.routes = routes;
	this.config = nodeserver.config;
	this.nodeserver = nodeserver;

	console.log(this.config);


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
			next();
		});

		this.app.set('views', __dirname + '/views');
		this.app.set('view engine', 'jade');

		this.app.locals.pretty = true;
	};


	this.configureRoutes = function() {
		this.app.get('/', this.routes.home);

		this.app.all('/login', this.routes.login);
		this.app.get('/logout', this.routes.logout);
	};


	this.adminInterface = function() {
		var self = this;
		
		/*
		this.app.get('/', function(req, res) {
			if(!req.session.validAdmin) {
				res.redirect('/login');
			} else {
				var html = '<ul>';

				for(var i = 0; i < self.websites.length; i++) {
					var website = self.websites[i];

					html += '<li><a href="/restart/' + i + '">' + ((website.process.running) ? '►' : '￭' ) + ' ' + website.name + '</a></li>';
				}

				html += '</ul>';
				res.write('<html><head><meta charset="utf-8"><title>nodeserver admin</title></head><body><h1>webs</h1>' + html + '</body></html>');
				res.end();
			}
		});
*/

		this.app.get('/restart/:id', function(req, res) {
			var i = req.params.id;
			var website = self.websites[i];

			website.process.stop();
			
			setTimeout(function() {
				website.process.start();
			}, 1000);

			res.redirect('/');
		});


		/*this.app.all('/login', function(req, res) {
			if(req.route.method == 'post') {
				var user = req.body.user;
				var password = req.body.password;

				if(user == config.user && password == config.password) {
					req.session.validAdmin = true;
					res.redirect('/');
					return;
				}
			}

			res.write('<html><body><form method="post" action="/login"><input type="text" name="user" /><input type="password" name="password" /><input type="submit" /></form></body></html>');
			res.end();
		});*/

		this.app.listen(this.config.port || 10000);
	};


	this.configureExpress();
	this.configureRoutes();
}