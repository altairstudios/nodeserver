module.exports = exports = function(req, res) {
	if(!req.session || !req.session.validAdmin) {
		res.redirect('/login');
		return;
	}

	var findId = function(websites, webisteId) {
		for(var i = 0; i < websites.length; i++) {
			/*for(var j = 0; j < websites[i].bindings.length; j++) {
				if(websites[i].bindings[j] == binding) {
					return websites[i];
				}
			}*/

			if(websites[i].id == webisteId) {
				return websites[i];
			}
		}
	};

	var website = findId(req.nodeserver.websites, req.params.webisteId);

	res.render('website', { website: website, websites: req.nodeserver.websites });
};