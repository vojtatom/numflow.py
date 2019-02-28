#!/bin/bash

#sudo service nginx start

cd "$(dirname "$0")"
DIR=$PWD

. ./env/bin/activate
cd flow


if [ "$1" == "mac" ]
    then
    echo "todo"

elif [ "$1" == "lin" ]
    then
    if [ "$2" == "all" ]
        then
        echo "C BUILD ======"
        ./build.sh
        echo "NGINX ======"
        sudo nginx -c "$DIR"/flow/nginx.conf
        sudo service nginx status
        echo "REDIS ======"
        redis-server --daemonize yes
    
    elif [ "$2" == "nginx" ]
        then
        echo "NGINX ======"
        sudo nginx -c "$DIR"/flow/nginx.conf
        sudo service nginx status
    fi

    echo "JS BUILD ======"
    ./jsbuild.sh

    NAME="flow"                              #Name of the application (*)
    DJANGODIR="$DIR"/flow             # Django project directory (*)
    SOCKFILE="$DIR"/flow/run/gunicorn.sock        # we will communicate using this unix socket (*)
    USER=nginx                                        # the user to run as (*)
    GROUP=webdata                                     # the group to run as (*)
    NUM_WORKERS=1                                     # how many worker processes should Gunicorn spawn (*)
    DJANGO_SETTINGS_MODULE=flow.settings             # which settings file should Django use (*)
    DJANGO_WSGI_MODULE=flow.wsgi                     # WSGI module name (*)

    echo "Starting $NAME as `whoami`"

    #export DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
    #export PYTHONPATH=$DJANGODIR:$PYTHONPATH
    # Create the run directory if it doesn't exist
    echo $SOCKFILE
    RUNDIR=$(dirname $SOCKFILE)
    test -d $RUNDIR || mkdir -p $RUNDIR

    # Start your Django Unicorn
    # Programs meant to be run under supervisor should not daemonize themselves (do not use --daemon)
    gunicorn ${DJANGO_WSGI_MODULE}:application --name $NAME --workers $NUM_WORKERS --bind=unix:$SOCKFILE &
    daphne flow.asgi:application --bind 0.0.0.0 --port 9000 --verbosity 1 &

elif [ "$1" == "kill" ]
    then
    sudo pkill nginx
    sudo pkill gunicorn
    sudo pkill daphne
elif [ "$1" == "stop" ]
    then
    sudo service nginx stop
    sudo pkill gunicorn
    sudo pkill daphne
elif [ "$1" == "clean" ]
    then
    ./build.sh clean
else
    echo "Specify platform: 'mac' or 'lin'"
fi
