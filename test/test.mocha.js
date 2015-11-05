var assert = require('assert');
var testConfiguration = require('./tests/configurations');


describe('Configurations', function() {
	describe('Incomplete configurations', function() {
		it('No configuration set', function(done){ testConfiguration.noConfigurations(done); });
		it('malformed configuration from file', function(done){ testConfiguration.malformedConfigurationFile(done); });
		it('empty configuration from file', function(done){ testConfiguration.emptyConfigurationFile(done); });
		it('empty configuration from json', function(done){ testConfiguration.emptyConfigurationJSON(done); });
		it('string properties configuration from file', function(done){ testConfiguration.stringPropertiesFile(done); });
		it('string properties configuration from json', function(done){ testConfiguration.stringPropertiesJSON(done); });
	});
});

describe('Admin', function() {
	describe('Test admin configuration', function() {
		it('Set admin config empty');
		it('Set only active false and check access');
		it('Set only active true and check access');
		it('Set user void');
		it('Set password void');
		it('Set user and password void');
		it('Set invalid password');
		it('Set used port');
		it('Set all correct data and desactive');
	});

	describe('Test admin login', function() {
		it('Try without user and password');
		it('Try with user and no password');
		it('Try with password and no user');
		it('Try incorrect login');
		it('Try login incorrect 5 times and check if banned');
		it('Try correct access');
	});
});

describe('Server type', function() {
	describe('General', function() {
		describe('Simple configurations', function() {
			it('Test no name');
			it('Test only name');
			it('Test empty bindings');
			it('Test duplicated bindings');
			it('Test bindings out of ports range: eg. 70000');
		});

		describe('Secure configurations', function() {
			it('Test empty certs');
			it('Test certs invalids');
			it('Test key invalid');
			it('Test cert invalid');
			it('Test first ca invalid');
			it('Test second ca invalid');
			it('Test used binding');
			it('Test used port');
			it('Test correct SSL configuration');
			it('Test first site with SSL and second without SSL');
			it('Test first site without SSL and second with SSL');
		});
	});

	describe('Node', function() {
		describe('Configurations', function() {
			it('Test name and port');
			it('Test duplicated port');
			it('Test used port');
		});

		describe('Node types', function() {
			it('No node script');
			it('Node script with init error');
			it('Node script correct');
		});
	});

	describe('CGI', function() {
		describe('Connections', function() {
			it('Test no page with 404');
			it('Test HTML pages');
			it('Test PHP pages with error');
			it('Test PHP pages correct');
		});
	});

	describe('PHP', function() {
		describe('Connections', function() {
			it('Test no page with 404');
			it('Test HTML pages');
			it('Test PHP pages with error');
			it('Test PHP pages correct');
			it('Test ModRewrite page');
		});
	});

	describe('CDN', function() {
		describe('Connections', function() {
			it('Test files cache');
		});
	});
});