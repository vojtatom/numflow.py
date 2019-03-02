#!/bin/bash

#sudo service nginx start

cd "$(dirname "$0")"
DIR="$PWD"/flow


start_gunicorn(){
    NAME="flow"                                     # Name of the application (*)
    DJANGODIR="$DIR"                           # Django project directory (*)
    SOCKFILE="$DIR"/run/gunicorn.sock          # we will communicate using this unix socket (*)
    NUM_WORKERS=1                                   # how many worker processes should Gunicorn spawn (*)
    DJANGO_SETTINGS_MODULE=flow.settings            # which settings file should Django use (*)
    DJANGO_WSGI_MODULE=flow.wsgi                    # WSGI module name (*)

    #export DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
    #export PYTHONPATH=$DJANGODIR:$PYTHONPATH
    # Create the run directory if it doesn't exist
    RUNDIR=$(dirname $SOCKFILE)
    test -d $RUNDIR || mkdir -p $RUNDIR

    # Start your Django Unicorn
    # Programs meant to be run under supervisor should not daemonize themselves (do not use --daemon)
    gunicorn ${DJANGO_WSGI_MODULE}:application --name $NAME --workers $NUM_WORKERS --bind=unix:$SOCKFILE &
}

task_started() {
    echo -n "task $1"
}

task_finished(){
    echo " ...finished with code $?"
}

build_and_run_base(){
    task_started "c build"
    "$DIR"/build.sh >> runlog.txt 2>&1
    task_finished

    task_started "redis"
    docker run -p 6379:6379 -d redis:2.8 >> runlog.txt 2>&1
    task_finished 
}

run_nginx(){
    task_started "nginx"
    sudo nginx -c $1 >> runlog.txt 2>&1
    task_finished
}

run_common(){
    task_started "jsbuild"
    "$DIR"/jsbuild.sh >> runlog.txt 2>&1
    task_finished
    
    task_started "collect static"
    python "$DIR"/manage.py collectstatic --noinput >> runlog.txt 2>&1
    task_finished

    cd "$DIR"

    task_started "gunicorn"
    start_gunicorn
    task_finished

    task_started "daphne"
    daphne flow.asgi:application --bind 0.0.0.0 --port 9000 --verbosity 1 &
    task_finished
}

stop(){
    task_started "stopping apps"
    sudo pkill -SIGINT nginx
    sudo pkill -SIGINT gunicorn
    sudo pkill -SIGINT daphne
    sudo pkill -SIGINT python

    sleep 3
    task_finished

    KILLCHECK=`pgrep python | wc -l`
    if [ $KILLCHECK -ne 0 ]
        then

        task_started "additional python kill"
        sudo pkill python
        task_finished
    fi
}


. ./env/bin/activate


if [ "$1" == "mac" ] || [ "$1" == "lin" ]
    then
    if [ "$2" == "all" ]
        then
        build_and_run_base
    fi

    if [ "$2" == "restart" ]
        then
        stop
    fi

    if [ "$1" == "mac" ] 
        then
        run_nginx "$DIR"/nginxmac.conf
        
    elif [ "$1" == "lin" ]
        then
        run_nginx "$DIR"/nginx.conf
    fi

    run_common

elif [ "$1" == "stop" ]
    then
    stop

elif [ "$1" == "clean" ]
    then

    task_started "cleaning c build"
    "$DIR"/build.sh clean
    task_finished


elif [ "$1" == "help" ]
    then
    echo "Master bash script for running flow server in production

    ./launch.sh [platform|command] [options]

platform:
    mac         start app on mac
    lin         start app on linux

command:
    stop        kill running servers/enviroments
    clean       clean the most recent build

options:
    all         run all including built of C sources and fetch of javascript files
    nginx       start app on given platform and reload nginx
    restart     clean, build js and restart all
"

else
    echo "Specify at least the platform: 'mac' or 'lin'"
fi
