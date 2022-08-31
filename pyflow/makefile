# get redis

#wget http://download.redis.io/redis-stable.tar.gz
#tar xvzf redis-stable.tar.gz
#cd redis-stable
#make install

## when somethign goes wrong 
#make distclean

#starting server linux
#redis-server --daemonize yes

#starting server mac
#docker run -p 6379:6379 -d redis:2.8

#test running
#redis-cli ping
#ps aux | grep redis-server
#
#sudo apt install virtualenv
#virtualenv --python=python3 env
#
#pip install channels

all: linux
.PHONY: linux mac linuxEnv macEnv clean cleanall check PYTHON-exists backend run

#branching
linux: linuxEnv
mac: macEnv

#check python
check: PYTHON3-exists
PYTHON3-exists: 
	@echo "Locating python3, please have at least python 3.6"
	@which python3 > /dev/null

#environments
linuxEnv: check
	@-( \
		echo "checking linux python environment"; \
		\
		virtualenv 2>&1 >/dev/null; \
		([ "$$?" != "127" ] && echo "virtualenv installed") \
		|| sudo apt install virtualenv; \
	)

macEnv: check
	@-( \
		echo "checking mac python environment"; \
		\
		virtualenv 2>&1 >/dev/null; \
		([ "$$?" != "127" ] && echo "virtualenv installed") \
		|| pip3 install virtualenv; \
	)

#common
linux mac:
	@chmod 755 flow/build.sh
	@chmod 755 flow/jsbuild.sh
	@-( \
		echo "creating python environment"; \
		virtualenv --python=python3 env; \
		. ./env/bin/activate; \
		\
		echo "installing requirements"; \
		pip install -r requirements.txt; \
		cd ./flow; \
		\
		echo "building C and assembling JS contents"; \
		./build.sh; \
		./jsbuild.sh; \
		\
		echo "managing database"; \
		python manage.py makemigrations; \
		python manage.py migrate; \
		\
		echo "managing static files"; \
		mkdir static; \
		mkdir ./static/static_local; \
		python manage.py collectstatic --noinput; \
		\
		echo "initializing superuser"; \
		echo ""; \
		echo "In the following steps, \e[31please create an account\e[39\nof the application administrator. You will be able\nto login and manage the django framework under this account."; \
		python manage.py createsuperuser; \
		echo "Now, run the application with 'make run'"; \
		echo "Run the computation backend with 'make backend'"; \
	)

rebuild:
	@-( \
		. ./env/bin/activate; \
		cd ./flow; \
		\
		echo "building C and assembling JS contents"; \
		./build.sh; \
		./jsbuild.sh; \
		\
		echo "managing database"; \
		python manage.py makemigrations; \
		python manage.py migrate; \
		\
		echo "managing static files"; \
		mkdir static; \
		mkdir ./static/static_local; \
		python manage.py collectstatic --noinput; \
	)

run:
	@-( \
		. ./env/bin/activate; \
		echo "running application"; \
		echo ""; \
		echo "To run the computation backend,\ngo and type 'make backend'"; \
		echo ""; \
		echo "Open browser supporting WebGL2 (Chrome, Chromium, Electron, Brave...)\nand go to '0.0.0.0:9000'."; \
		echo ""; \
		python flow/manage.py runserver "0.0.0.0:9000"; \
	)

backend:
	@-( \
		. ./env/bin/activate; \
		echo "running backend"; \
		echo ""; \
		cd ./flow; \
		python background.py;  \
	)	

clean:
	@-rm -rf flow/static
	@-flow/build.sh clean

cleanall: clean
	@-rm -rf env
	@-rm flow/db.sqlite3
	@-rm flow/media*
