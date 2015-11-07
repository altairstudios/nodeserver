var assert = require('assert');
var nodeserverClass = require('../../nodeserver');


module.exports = exports = {
	noConfigurations: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.start();

		assert.equal(0, nodeserver.websites.length, 'The number of web pages should be 0');
		assert.equal(undefined, nodeserver.admin, 'The admin should be undefined');

		nodeserver.exit();
		done();
	},
	malformedConfigurationFile: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfigFile('./configurations/error-configurations/malformed.config');
		nodeserver.start();

		assert.equal(0, nodeserver.websites.length, 'The number of web pages should be 0');
		assert.equal(undefined, nodeserver.admin, 'The admin should be undefined');

		nodeserver.exit();
		done();
	},
	emptyConfigurationFile: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfigFile('./configurations/error-configurations/empty.config');
		nodeserver.start();

		assert.equal(0, nodeserver.websites.length, 'The number of web pages should be 0');
		assert.equal(undefined, nodeserver.admin, 'The admin should be undefined');

		nodeserver.exit();
		done();
	},
	emptyConfigurationJSON: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({});
		nodeserver.start();

		assert.equal(0, nodeserver.websites.length, 'The number of web pages should be 0');
		assert.equal(undefined, nodeserver.admin, 'The admin should be undefined');

		nodeserver.exit();
		done();
	},
	stringPropertiesFile: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfigFile('./configurations/error-configurations/string-properties.config');
		nodeserver.start();

		assert.equal(0, nodeserver.websites.length, 'The number of web pages should be 0');
		assert.equal(undefined, nodeserver.admin, 'The admin should be undefined');

		nodeserver.exit();
		done();
	},
	stringPropertiesJSON: function(done) {
		var nodeserver = new nodeserverClass(false);
		nodeserver.readConfig({ "nodeserver": "This need throw an error", "sites": "This need throw an error" });
		nodeserver.start();

		assert.equal(0, nodeserver.websites.length, 'The number of web pages should be 0');
		assert.equal(undefined, nodeserver.admin, 'The admin should be undefined');

		nodeserver.exit();
		done();
	}
};