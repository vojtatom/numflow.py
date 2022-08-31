#!/bin/bash

cd "$(dirname "$0")"

if [ "$1" == "clean" ]
    then
    find . -type d -wholename '*/build' -exec rm -r {} +
    find . -type f -name '*.so' -exec rm {} +
    find ./visual/modules/ -type f -name '*.html' -exec rm {} +
    find . -type f -name '*.c' -exec rm {} +
    find . -type f -name '*.cpp' -exec rm {} +
elif [ "$1" == "annot" ]
    then
    find . -type f -name '*.pyx' -exec cython -a {} +
elif [ "$1" == "install" ]
    then
    python3 setup.py install
else
    python3 setup.py build_ext --inplace
    find . -type f -name '*.pyx' -exec cython -a {} +
    python3 setup.py clean
fi