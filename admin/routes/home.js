module.exports = exports = function(req, res) {
	if(!req.session || !req.session.validAdmin) {
		res.redirect('/login');
		return;
	}

	res.render('home', { websites: req.nodeserver.websites });
};