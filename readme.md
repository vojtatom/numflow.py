# VIZ

Based on some [older code](https://github.com/vojtatom/numflow), written in Python/Cython/C++

Changes in `.cpp`, `.hpp`, `.pyx`, and `.pyd` requre recompilation of the numflow package, use attached makefile to do so (command `make python`), changes in `.py` files do not require compilation.
Before commiting, please run `make clean` to remove unnecesary build files, I tried to include them all in gitignore, but something hight have slipped through.


