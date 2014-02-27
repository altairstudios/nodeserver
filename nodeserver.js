var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxy();

var options = {
  '127.0.0.1:8080': 'http://localhost:10000',
  'localhost:8080': 'http://localhost:10002'
}

require('http').createServer(function(req, res) {
  console.log(req.headers.host);
  console.log(options[req.headers.host]);

  proxy.web(req, res, {
    target: options[req.headers.host]
  }, function(e) {
    console.log(e);
  });
}).listen(8080);