var findId = function(websites, webisteId) {
	for(var i = 0; i < websites.length; i++) {
		if(websites[i].id == webisteId) {
			return websites[i];
		}
	}
};


var stop = function(website) {
	if(website.processStatus != 'stop' && website.processStatus != 'end') {
		website.operations.stop();
	}
};


var start = function(website) {
	if(website.processStatus != 'start') {
		website.operations.start();
	}
};

var restart = function(website) {
	stop(website);
	start(website);
};


module.exports = exports = {
	start: function(req, res) {
		if(!req.session || !req.session.validAdmin) {
			res.redirect('/login');
			return;
		}

		var website = findId(req.nodeserver.websites, req.params.websiteId);
		start(website);

		res.redirect('/websites/' + req.params.websiteId);
	},
	restart: function(req, res) {
		if(!req.session || !req.session.validAdmin) {
			res.redirect('/login');
			return;
		}

		var website = findId(req.nodeserver.websites, req.params.websiteId);

		restart(website);

		res.redirect('/websites/' + req.params.websiteId);
	},
	stop: function(req, res) {
		if(!req.session || !req.session.validAdmin) {
			res.redirect('/login');
			return;
		}

		var website = findId(req.nodeserver.websites, req.params.websiteId);

		stop(website);

		res.redirect('/websites/' + req.params.websiteId);
	}
};