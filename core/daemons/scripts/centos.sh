#!/bin/bash
#
# nodeserver NodeJS Web Server for node, python, php
#
# chkconfig: 345 80 20
#
# description: NodeServer is a NodeJS Web Server for node, python, php
# processname: nodeserver
#
### BEGIN INIT INFO
# Provides: nodeserver
# Required-Start: $local_fs $remote_fs
# Required-Stop: $local_fs $remote_fs
# Should-Start: $network
# Should-Stop: $network
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6
# Short-Description: NodeServer init script
# Description: NodeServer is a NodeJS Web Server for node, python, php
### END INIT INFO

NAME=nodeserver
NODESERVER=/usr/local/bin/nodeserver
USER=root

export PATH=%NODE_PATH%:$PATH
export NODESERVER_HOME="%HOME_PATH%"

super() {
    su - $USER -c "PATH=$PATH; NODESERVER_HOME=$NODESERVER_HOME $*"
}

start() {
    echo "Starting $NAME"
    super $NODESERVER start
    retval=$?
}

stop() {
    echo "Stopping $NAME"
    super $NODESERVER stop
}

restart() {
    echo "Restarting $NAME"
    stop
    start
}

reload() {
    echo "Reloading $NAME"
    super $NODESERVER reload
}

status() {
    echo "Status for $NAME:"
    super $NODESERVER status
    RETVAL=$?
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        restart
        ;;
    reload)
        reload
        ;;
    *)
        echo "Usage: {start|stop|status|restart|reload}"
        exit 1
        ;;
esac
exit $RETVAL
