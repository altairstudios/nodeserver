module.exports = exports = {
	start: function(website) {
	},
	request: function(req, res, website, engine) {
		res.statusCode = 504;
		res.end('The website not respond');
	}
};