# VIZ

Simple visualization framework based on PyOpenGL and NumPy. Based on some [older code](https://github.com/vojtatom/numflow), written in Python/Cython/C++.

## Dependencies
List of python dependencies:
    
    numpy #matrices, linear algebra
    scipy #backup integrator and interpolator, not really used in this project if everythong works well
    cython #connecting python and c++
    setuptools #compiling cython and c++
    astropy #loading and saving .fits files
    pyopengl #opengl
    pyopengl_accelerate #opengl again
    imageio #saving screenshots
    pyrr #math for opengl
    pygame #drawing text on the screen

There maybe some additional depenendencies, however those should be taken care of during the installation of the packages above. **Please note, that the OFFICIAL pyopengl and pyopengl_accelerate FOR WINDOWS are not currently maintained (or at least it seems so) and there are unofficial wheels for pyopengl and pyopengl_accelerate, which are up to date.** (We had the project running on windows during development). The unofficial distribution also includes GLUT dlls needed for the window management. If you are on Linux, there should be no problem, you can just install thy python packages from above (+ FreeGLUT and OpenGL stuff related to your platform). MacOS does not officially support OpenGL, sorry (although it should be possible to run the code with some minor tweaks related to opengl and glut on your mac).  

## Compilation and running
There is makefile for Linux, the makefile runs the setup.py and compiles thy Cython/C++ stuff.  On Windows, please compile the code with python command `python3 setup.py build_ext --inplace` which will build all the stuff inplace. You can use e.g. Anaconda prompt for the compilation. 

## Using the numflow framework
This fork of the numflow framework offers:

* simple Python API simmilar to matplotlib package
* C++ implementation of file readers for rectilinear datasets (supports `.csv`, `.npy`, and `.fits` file formats)
* C++ implementation of trilinear interpolation
* C++ implementation of RK45 adaptive integration routine
* but mostly 3D visualization using slices, glyphs and streamlines

How to use the numflow framework:

    from numflow import Visualization 

    vis = Visualization()
    vis.load_dataset("el1_512_512_512.csv")
    #or
    #vis.load_dataset("el1_512_512_512.npy")
    #or
    #vis.load_dataset("el1_512_512_512.fits")

    #add semi-transparent glyphs in the overall dataset
    vis.add_glyphs(numSamples=10000, size=0.1, transparency=0.2)

    #add highres planes positioned at axis_coord=0
    vis.add_slice(0, axis="x", resolution=[1000, 1000], transparency=1.0)
    vis.add_slice(0, axis="y", resolution=[1000, 1000], transparency=1.0)
    vis.add_slice(0, axis="z", resolution=[1000, 1000], transparency=1.0)

    #add streamlines into a subregion of the dataset and mark the region with a box
    region_low = [-1, -1, -3]
    region_high = [1, 1, 3]

    vis.add_box(region_low, region_high)
    vis.add_streamline(0, 1000, numSamples=100, size=0.05, low=region_low, high=region_high)

    #shows the constructed visualization
    vis.display()

You can also find a handy information in the terminal, the numflow notifies about the dataset resolution and dimensions upon loading. 

## Renderer navigation
There is a number of ways how to interact with the renderer window:
 * **C** - Captures the window contents and saves it as `screenX.png`, the images do not overwrite, instead the X is replaced with a higher number.
 * **1** - Front view
 * **3** - Side view
 * **7** - Top view
 * **U/I** - Increase/Decrease the gamma value transforming the colormap. The change is also visible in the colorbar on the left
 * **M/N** - Shift the plane delimiting the rendered area
 * **S** - Switch the active border of the rendered area - We know the application lacks any form of feedback showing which plane is active, we apologise, we simply run of time, although we know this should be improved e.g. by highlighting the active sqaure.
 * **R** - Toggle magnitude mapping onto glyph size.


## Developer notes
Changes in `.cpp`, `.hpp`, `.pyx`, and `.pyd` requre recompilation of the numflow package, use attached makefile to do so (command `make`), changes in `.py` files do not require compilation. Before commiting, please run `make clean` to remove unnecesary build files, I tried to include them all in gitignore, but something might have slipped through.

## Known bugs
 * interpolation - sometimes due to rounding errors the values *exactly* at the border of the dataset will produce *out-of-dataset* values. This is not a critical bug, since the tiniest shift in the direction inside the dataset produces correct results. Has no effect at the output of the visualizatin.
n