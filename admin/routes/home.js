var os = require('os');

module.exports = exports = function(req, res) {
	if(!req.session || !req.session.validAdmin) {
		res.redirect('/login');
		return;
	}

	/*console.log(os.loadavg());
	console.log(os.totalmem());
	console.log(os.freemem());
	console.log(os.cpus());
	console.log(os.uptime());
	console.log(os.release());
	console.log(os.arch());
	console.log(os.networkInterfaces());*/

	var memory = {
		total: os.totalmem(),
		free: os.freemem(),
		used: os.totalmem() - os.freemem()
	}


	var cpus = {
		cpus: os.cpus(),
		load: os.loadavg(),
		uptime: os.uptime()
	}

	res.render('home', { websites: req.nodeserver.websites, memory: memory, cpus: cpus });
};