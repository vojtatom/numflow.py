import sys, os
from distutils.core import setup # pylint: disable=no-name-in-module,import-error
from distutils.extension import Extension # pylint: disable=no-name-in-module,import-error
from Cython.Distutils import build_ext

import numpy as np

def scandir(dir, files=[]):
    for file in os.listdir(dir):
        path = os.path.join(dir, file)
        if os.path.isfile(path) and path.endswith(".pyx"):
            files.append(path.replace(os.path.sep, ".")[:-4])
        elif os.path.isdir(path):
            scandir(path, files)
    return files


# generate an Extension object from its dotted name
def makeExtension(extName):
    extPath = extName.replace(".", os.path.sep)+".pyx"
    print('path:', extName, extPath)
    return Extension(
        extName,
        [extPath],
        include_dirs = [".", np.get_include()],   # adding the '.' to include_dirs is CRUCIAL!!
        extra_compile_args = ["-Wall"],
        extra_link_args = ['-g', '-Wno-cpp', '-ffast-math', '-O3'],
        define_macros = [('NPY_NO_DEPRECATED_API', 'NPY_1_7_API_VERSION')],
        )


# get the list of extensions
extNames = scandir("visual")

# and build up the set of Extension objects
extensions = [makeExtension(name) for name in extNames]

# finally, we can pass all this to distutils
setup(
  name="visual",
  packages = ["visual.modules.numeric", "visual.modules.numeric.data", "visual.modules.numeric.math"],
  ext_modules = extensions,
  cmdclass = {'build_ext': build_ext},
)
