
var terminal = module.exports = exports = {
	operations: {
		start: function(params) {
			console.log('start')
		},
		stop: function(params) {
			console.log('stop')
		},
		reload: function(params) {
			console.log('reload')
		},
		status: function(params) {
			console.log('status')
		},
		help: function(params) {
			console.log('help')
		},
	},
	process: function(params) {
		if(params.length < 3) {
			params[2] = 'help';
		}

		var operation = params[2];

		if(terminal.operations[operation]) {
			terminal.operations[operation](params);
		} else {
			console.log('invalid operation');
		}
	}
}