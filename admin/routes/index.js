var websiteOperations = require('./website-operations.js');

module.exports = exports = {
	login: require('./login.js'),
	logout: require('./logout.js'),
	home: require('./home.js'),
	website: require('./website.js'),
	config: require('./config.js'),

	websiteStart: websiteOperations.start,
	websiteRestart: websiteOperations.restart,
	websiteStop: websiteOperations.stop
};