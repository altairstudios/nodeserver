var childProcess = require('child_process');
var assert = require('assert');
var http = require('http');



describe('Configuration checks', function(){
	it('No configuration set', function(done){
		var nodeserver = new require('../nodeserver')(false);
		nodeserver.start();

		assert.equal(0, nodeserver.websites.length, 'The number of web pages should be 0');

		done();
	});


	it('malformed configuration', function(done){
		var nodeserver = new require('../nodeserver')(false);
		nodeserver.readConfigFile('./configurations/malformed.config');

		assert.equal(0, nodeserver.websites.length, 'The number of web pages should be 0');

		done();
	});
});