var assert = require('assert');

var tests = {
	configuration: require('./tests/configurations'),
	admin: require('./tests/admin'),
	server: {
		cdn: require('./tests/server.cdn')
	}
}



process.setMaxListeners(1000);



describe('Configurations', function() {
	describe('Incomplete configurations', function() {
		it('No configuration set', tests.configuration.noConfigurations);
		it('malformed configuration from file', tests.configuration.malformedConfigurationFile);
		it('empty configuration from file', tests.configuration.emptyConfigurationFile);
		it('empty configuration from json', tests.configuration.emptyConfigurationJSON);
		it('string properties configuration from file', tests.configuration.stringPropertiesFile);
		it('string properties configuration from json', tests.configuration.stringPropertiesJSON);
	});
});



describe('Admin', function() {
	describe('Test admin configuration', function() {
		it('Set admin config empty', tests.admin.configEmpty);
		it('Set only active false and check online', tests.admin.onlyActiveFalse);
		it('Set only active true and check online', tests.admin.onlyActiveTrue);
		it('Set only active true and check access', tests.admin.onlyActiveTrueAccess);
		it('Set user void and check access', tests.admin.onlyUserVoidAccess);
		it('Set password void and check access', tests.admin.onlyPasswordVoidAccess);
		it('Set user and password void', tests.admin.userPasswordVoidAccess);
		it('Set invalid password', tests.admin.invalidPassword);
		it('Set used port', tests.admin.usedPort);
		it('Set all correct data and desactive', tests.admin.allOkButDesactivate);
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
			it('Test html index default response', tests.server.cdn.indexResponse);
			it('Test html index default html response', tests.server.cdn.htmlIndexResponse);
			it('Test html index default htm response', tests.server.cdn.htmIndexResponse);
			it('Test files cache');
		});
	});
});