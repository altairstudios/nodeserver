var assert = require('assert');
var testConfiguration = require('./tests/configurations');
var testAdmin = require('./tests/admin');



process.setMaxListeners(1000);



describe('Configurations', function() {
	describe('Incomplete configurations', function() {
		it('No configuration set', testConfiguration.noConfigurations);
		it('malformed configuration from file', testConfiguration.malformedConfigurationFile);
		it('empty configuration from file', testConfiguration.emptyConfigurationFile);
		it('empty configuration from json', testConfiguration.emptyConfigurationJSON);
		it('string properties configuration from file', testConfiguration.stringPropertiesFile);
		it('string properties configuration from json', testConfiguration.stringPropertiesJSON);
	});
});



describe('Admin', function() {
	describe('Test admin configuration', function() {
		it('Set admin config empty', testAdmin.configEmpty);
		it('Set only active false and check online', testAdmin.onlyActiveFalse);
		it('Set only active true and check online', testAdmin.onlyActiveTrue);
		it('Set only active true and check access', testAdmin.onlyActiveTrueAccess);
		it('Set user void and check access', testAdmin.onlyUserVoidAccess);
		it('Set password void and check access', testAdmin.onlyPasswordVoidAccess);
		it('Set user and password void', testAdmin.userPasswordVoidAccess);
		it('Set invalid password', testAdmin.invalidPassword);
		it('Set used port', testAdmin.usedPort);
		it('Set all correct data and desactive', testAdmin.allOkButDesactivate);
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