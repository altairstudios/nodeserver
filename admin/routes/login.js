var crypto = require('crypto');


module.exports = exports = function(req, res) {
	if(req.method == 'POST') {
		var user = req.body.user;
		var password = req.body.password;

		if(user == req.config.nodeserver.admin.user && crypto.createHash('md5').update(password).digest('hex') == req.config.nodeserver.admin.password) {
			req.session.validAdmin = true;
			res.redirect('/');
			return;
		} else {
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

			if(req.admin.loginErros[ip]) {
				req.admin.loginErros[ip].errors = req.admin.loginErros[ip].errors + 1;
				req.admin.loginErros[ip].last = new Date();
				
				if(req.admin.loginErros[ip].errors > 5) {
					req.admin.loginErros[ip].block = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
				}
			} else {
				req.admin.loginErros[ip] = {
					errors: 1,
					last: new Date(),
					block: null
				};
			}
		}
	}

	res.render('login');
};