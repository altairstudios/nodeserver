module.exports = exports = {
	refresh: function(req, res) {
		if(!req.session || !req.session.validAdmin) {
			res.redirect('/login');
			return;
		}

		req.nodeserver.hotConfig();

		res.redirect('/?1');
	}
};