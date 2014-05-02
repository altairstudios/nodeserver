module.exports = exports = function(req, res) {
	if(!req.session || !req.session.validAdmin) {
		res.redirect('/login');
		return;
	}

	var findBinding = function(websites, binding) {
		for(var i = 0; i < websites.length; i++) {
			for(var j = 0; j < websites[i].bindings.length; j++) {
				if(websites[i].bindings[j] == binding) {
					return websites[i];
				}
			}
		}
	};
	
	var website = findBinding(req.nodeserver.websites, req.params.binding);

	res.render('website', { website: website });
};