describe('Configuration checks', function(){
	it('No configuration set', function(done){
		var nodeserver = require('../nodeserver');
		nodeserver.start();
		done();
	});	

	it('malformed configuration', function(done){
		var nodeserver = require('../nodeserver');
		nodeserver.readConfigFile("./configurations/malformed.config");
		done();
	});
});