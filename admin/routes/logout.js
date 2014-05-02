module.exports = exports = function(req, res) {
	req.session.regenerate(function() {
		res.redirect('/');
	});
};