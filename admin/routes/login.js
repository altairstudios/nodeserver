module.exports = exports = function(req, res) {
	if(req.route.method == 'post') {
		var user = req.body.user;
		var password = req.body.password;

		if(user == req.config.nodeserver.admin.user && password == req.config.nodeserver.admin.password) {
			req.session.validAdmin = true;
			res.redirect('/');
			return;
		}
	}

	res.render('login', { prueba: 'abc'});
};