var path = require('path');
var fs = require('fs');
var childProcess = require('child_process');
var send = require('send');
var parseUrl = require('parseurl');



/**
 * Object to manage website type for nodejs
 * @type {Object}
 */
module.exports = exports = {
	start: function(website) {
	},
	request: function(req, res, website, engine) {
		send(req, parseUrl(req).pathname, {
			root: website.script,
			dotfiles: 'allow',
			etag: true,
			lastModified: true,
			maxAge: 0
		}).pipe(res);
	}
};