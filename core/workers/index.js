module.exports = exports = new function() {
	var self = this;
	this.nodeserver = null;
	this.proxy = null;



	this.workers = {
		'node': require('./node'),
		'cgi': require('./cgi'),
		'php': require('./php'),
		'cdn': require('./cdn')
	};



	this.start = function(website) {
		if(this.workers[website.type]) {
			this.workers[website.type].start(website);
		}
	};



	this.process = function(req, res) {
		var host = req.headers.host;
		var website = self.nodeserver.getWebsiteFromBinding(host);

		if(website == null) {
			res.statusCode = 400;
			res.end('No site');
		} else {
			if(self.workers[website.type]) {
				self.workers[website.type].request(req, res, website, self);
			} else {
				res.statusCode = 504;
				res.end('The website not respond');
			}
		}
	};
};