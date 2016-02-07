var os = require('os');

module.exports = exports = function(req, res) {
	if(!req.session || !req.session.validAdmin) {
		res.redirect('/login');
		return;
	}


	var memory = {
		total: os.totalmem(),
		free: os.freemem(),
		used: os.totalmem() - os.freemem()
	};


	var cpus = {
		cpus: os.cpus(),
		load: os.loadavg(),
		uptime: os.uptime()
	};

	res.render('home', { websites: req.nodeserver.websites, memory: memory, cpus: cpus, banned: req.admin.loginErros });
};