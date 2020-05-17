all: js #build
.PHONY: python upload clean

#environments
python: clean
	@-( \
		python3 setup.py build_ext --inplace; \
		find . -type f -name '*.pyx' -exec cython -a {} +;\
	)

clean:
	@-( \
		find . -type d -wholename '*/build' -exec rm -r {} +;\
    	find . -type f -name '*.so' -exec rm {} +;\
    	find ./numflow/cnumflow/ -type f -name '*.html' -exec rm {} +;\
    	find . -type f -name '*.c' -exec rm {} +;\
    	find . -type f -name '*.cpp' -not -path "*cnumflow/cpp*" -exec rm {} +;\
	)