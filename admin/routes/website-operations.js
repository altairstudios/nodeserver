var fs = require('fs');

var findId = function(websites, webisteId) {
	for(var i = 0; i < websites.length; i++) {
		/*for(var j = 0; j < websites[i].bindings.length; j++) {
			if(websites[i].bindings[j] == binding) {
				return websites[i];
			}
		}*/

		if(websites[i].id == webisteId) {
			return websites[i];
		}
	}
};


var stop = function(website) {
	if(website.process.running) {
		website.process.stop();
	}
}


var start = function(website) {
	if(!website.process.running && fs.existsSync(website.script)) {
		website.process.start();
	}
}

var restart = function(website) {
	stop(website);

	if(fs.existsSync(website.script)) {
		setTimeout(function() {
			website.process.start(true);
		}, 2000);
	}
}


module.exports = exports = {
	start: function(req, res) {
		if(!req.session || !req.session.validAdmin) {
			res.redirect('/login');
			return;
		}

		var website = findId(req.nodeserver.websites, req.params.websiteId);
console.log('#######')
		console.log(req.params)
		console.log('#######')
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

		setTimeout(function() {
			res.redirect('/websites/' + req.params.websiteId);
		}, 2500);
	},
	stop: function(req, res) {
		if(!req.session || !req.session.validAdmin) {
			res.redirect('/login');
			return;
		}

		var website = findId(req.nodeserver.websites, req.params.websiteId);

		stop(website);

		setTimeout(function() {
			res.redirect('/websites/' + req.params.websiteId);
		}, 2000);
	}
}