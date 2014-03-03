nodeserver
==========

Nodeserver is a NodeJS Web Server with reverse proxy functionality alternative to Nginx reverse proxy for NodeJS projects


## About

Nodeserver gives you:
*	A simple and light webserver written in javascript
*	Reverse proxy for nodejs projects and other web projects

... and also you can modify and adapt the server code.

We have a demo server site at [www.altairstudios.es](http://www.altairstudios.es/) and [www.copitosdenieve.com](http://www.copitosdenieve.com/) where you can see nodeserver in action.

If you have ideas or questions, open a new issue with your ideas.


### Example application script (proxytest.js)

You can found a demo in proxytest.js

Here is an example:
	
	var httpProxy = require('http-proxy');
	var nodeserver = require('nodeserver');

	nodeserver.addWebsite({
		name: "demo",
		type: "proxy",
		bindings: [
			"localhsot"
		],
		target: "http://localhost:10000"
	});

	nodeserver.addPort(80);

	nodeserver.start();



### Example etc configuration

Nodeserver binary can read a defined configuration in the same path of execution of nodeserver or /etc/nodeserver/nodeserver.config.

Here is an example of etc file:

	[{
		"name": "demo",
		"type": "proxy",
		"bindings": [
			"localhost:8080"
		],
		"target": "http://localhost:10001"
	},{
		"name": "demo - node",
		"type": "node",
		"bindings": [
			"localhost:8081"
		],
		"port": "10001",
		"script": "../web2/web2.js",
		"absoluteScript": false
	},{
		"name": "demo 2 - node",
		"type": "node",
		"bindings": [
			"localhost:8082"
		],
		"port": "10002",
		"script": "/Users/myuser/Sites/web1/web1.js",
		"absoluteScript": true
	}]


## Daemon script

	#!/bin/bash
	# Source function library.
	. /etc/rc.d/init.d/functions

	# Source networking configuration.
	. /etc/sysconfig/network

	RETVAL=0
	prog="nodeserver"

	start() {
	        # Start daemons.

		# Check that networking is up.
		[ ${NETWORKING} = "no" ] && exit 1

		[ -x /usr/local/bin/nodeserver ] || exit 1

	        if [ -d /etc/nodeserver ] ; then
	                CONFS=`ls /etc/nodeserver/*.conf 2>/dev/null`
	                [ -z "$CONFS" ] && exit 6
	                PROC_FAILED=0
	                for i in $CONFS; do
	                        site=`basename $i .conf`
	                        echo -n $"Starting $prog for $site: "
	                        daemon /usr/local/bin/nodeserver $i
	                        RETVAL=$?
	                        echo
	                        if [ $RETVAL -eq 0 ] && [ ! -f /var/lock/subsys/$prog ]; then
	                                touch /var/lock/$prog
	                        elif [ $RETVAL -ne 0 ]; then
	                                ps -FC nodeserver | grep "$i" > /dev/null
	                                RETVAL=$?
	                                if [ $PROC_FAILED -eq 0 ] && [ $RETVAL -ne 0 ]; then
	                                        PROC_FAILED=1
	                                fi
	                        fi
	                done
	                if [ $RETVAL -eq 0 ] && [ $PROC_FAILED -ne 0 ]; then
	                        RETVAL=1
	                fi
	        else
	                RETVAL=1
	        fi
	        return $RETVAL
	}

	stop() {
	        # Stop daemons.
	        echo -n $"Shutting down $prog: "
	        killproc $prog
	        RETVAL=$?
	        echo
	        [ $RETVAL -eq 0 ] && rm -f /var/lock/$prog
	        return $RETVAL
	}

	# See how we were called.
	case "$1" in
	  start)
	        start
	        ;;
	  stop)
	        stop
	        ;;
	  restart|reload)
	        stop
	        start
	        RETVAL=$?
	        ;;
	  condrestart|try-restart|force-reload)
	        if [ -f /var/lock/$prog ]; then
	            stop
	            start
	            RETVAL=$?
	        fi
	        ;;
	  status)
	        status $prog
	        RETVAL=$?
	        ;;
	  *)
	        echo $"Usage: $0 {start|stop|restart|try-restart|force-reload|status}"
	        exit 1
	esac

	exit $RETVAL



## Thanks

NodeServer is a free and open source community-driven project.

Thanks to the following companies and projects whose work we have used or taken inspiration from in the making of NodeServer:

* [Node.js](http://www.nodejs.org)
* [KeystoneJS](http://www.keystonejs.com)
* [ExpressJS](http://www.expressjs.com)
* [jQuery](http://www.jquery.com)
* [Digital Ocean](http://www.digitalocean.com/)
* [Azure](http://www.windowsazure.com/)
* [Lets Health](http://www.letshealth.com)



## License

(The MIT License)

Copyright (c) 2014 Juan Benavides

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.