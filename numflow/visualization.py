import numpy as np

from .graphics import Box, Context, Camera, Glyphs, Layer, Streamline, Colormap
from .load import load
from .integrate import sstreamlines, cstreamlines

from .exception import NumflowException
from threading import Event, Thread
import gc


def regular_points(start, end, sampling):
    spc = []
    for s, e, n in zip(start, end, sampling):
        spc.append(np.linspace(s, e, n, endpoint=True))

    k = np.reshape( \
            np.transpose( \
                np.meshgrid(*spc, sparse=False, indexing='ij') \
                ), (np.prod(sampling), 3) \
        )

    return k


def random_points(start, end, dataset, numSamples):
    if start is None:
        start = dataset.low
    else:
        start = np.array(start)
        start = np.amax([start, dataset.low], axis=0)

    if end is None:
        end = dataset.high
    else:
        end = np.array(end)
        end = np.amin([end, dataset.high], axis=0)
    

    return np.random.rand(numSamples, 3) * (end - start) + start


class Visualization:
    def __init__(self):
        """Class exposing user api for visualization, 
        the usual workflow follows:

        First create an instance of the visualization:
        >>> from numflow import Visualization 
        >>> app = Visualization()

        Then proceed with available api calls to
        * load the dataset
        * add colorcoded slice of the vector field
        * add glyphs
        * add streamlines 

        For further information, see the docstring of ther class methods.
        """

        #init so it does not fall
        self.camera = None
        self.context = Context(self)
        self.camera = Camera(500, 500)
        self.boxes = []
        self.layers = []
        self.glyphs = []
        self.streamlines = []
        self.dataset = False
        self.renderThread = None

        self.settings = {
            #minimal and maximal magnitudes
            "min": float(np.inf),
            "max": 0,
            #thresholds for filtering based on magnitude
            "min_threshold": 0,
            "max_threshold": float(np.inf),
            #colorma manip
            "gamma": 1.0,
            "gamma_incr": 0.05
        }
        
        self.colormap = Colormap(self.context.colormapProgram, self.settings)


    #------------------------------------------------------------------------------------------------
    # USER FUNCTIONS
    #------------------------------------------------------------------------------------------------

    def load_dataset(self, file):
        """Loads dataset from file. The input file has 
        to be a rectilinear dataset. Following formats are supported:

        * .csv with a row structure "x,y,z,v_x,v_y,v_z" 
        where x, y, z are spatial coordinates 
        and v_x, v_y, v_z are field vector values for corresponding point
        The lines do not have to be ordered in any special way. PLEASE NOTE, THAT LOADING DATASETS FROM CSVs IS EXTREMLY SLOW and therefore we encourage you to load the .csv dataset once and replace your file with the created tmp.fits file. it contains the very same dataset, only in a binary and compressed form (in our testing 6GB dataset transformed into 1.5GB)

        * .npy with a simmilar structure as *.csv file, the file should contain
        np.array with dtype=np.float32 with a shape [n, 6] where n is a number of 
        sample points in the dataset, if the dataset resolution is x_res times y_res times z_res
        than n = x_res * y_res * z_res

        * .fits with a following structure: 
            hdu[0] - headers only
            hdu[1] - ImageHDU(values - np.array with shape [ x_res, y_res, z_res, 3] and dtype np.float32)
            hdu[2] - ImageHDU(x-axis values - np.array with shape [ x_res ]  and dtype np.float32)
            hdu[3] - ImageHDU(y-axis values - np.array with shape [ y_res ]  and dtype np.float32)
            hdu[4] - ImageHDU(z-axis values - np.array with shape [ z_res ]  and dtype np.float32)
            This is the fastest loading option, since the dataset is in the internal file format already

        The dataset can contain nan values, in the .csv format those should be denoted with "NaN" string. 

        If you're loading .csv or .npy, the call also saves the parsed dataset into tmp.fits for a faster loading. In the next run, you can simply replace your dataset with the .fots one and proceed. The loading should be a matter of seconds instead of minutes.
        
        Args:
            file (str): name of the dataset file
        """

        if self.dataset is not None:
            self.dataset = None
            gc.collect()

        print("loading dataset")

        self.dataset = load(file, mode='c')
        
        print(f"dataset {file} loaded")
        print(f"Dataset stats:")
        print(f"    resolution {self.dataset.res}")
        print(f"    low        {self.dataset.low}")
        print(f"    high       {self.dataset.high}")

        #add main bounding box to the visualization
        box = Box(self.context.boxProgram, self.dataset.low, self.dataset.high)
        boxCenter = 0.5 * (self.dataset.low + self.dataset.high)
        self.camera.set_center(boxCenter)
        self.boxes.append(box)
        
        # create selection box
        lows = self.dataset.low
        highs = self.dataset.high

        # self.selection = Box(self.context.boxProgram, [lows[0]+2, lows[1]+2, lows[2]+2], [highs[0]-2, highs[1]-2, highs[2]-2])
        self.selection = Box(self.context.boxProgram, lows, highs)
        self.selection.color = np.array([1, 1, 1], dtype=np.float32)
        self.settings["selection"] = self.selection

        #setup camera center
        center = (highs + lows) / 2
        self.camera.center = center


    def add_box(self, low=None, high=None):
        """Adds a box into the visualization with the minimal coordinates 
        equal to low and maximal coordinates equal to high. If no values
        are supplied the box border defaults to the dataset borders.

        Args:
            low (np.array with shape [3], optional): minimal coordinates of the box. Defaults to None.
            high (np.array with shape [3], optional): maximal coordinates of the box. Defaults to None.
        """

        low = self.dataset.low.copy() if low is None else np.amax([low, self.dataset.low], axis=0)
        high = self.dataset.high.copy() if high is None else np.amin([high, self.dataset.high], axis=0)
        box = Box(self.context.boxProgram, low, high)
        self.boxes.append(box)


    def add_glyphs(self, numSamples=2000, low=None, high=None, size=1.0, transparency=1.0):
        """Adds randomly sampled glyphs into the visualization seeded in the selected area.
        The magnitude of the vector field can be also mapped onto the glyphs, the mapping 
        can be togolled by pressing "R".

        Args:
            numSamples (int, optional): Number of glyphs in the visualization. Defaults to 2000.
            low (list with shape [3], optional): Delimits minimal borders of the box where the glyphs are seeded, if no value is supplied, the dataset borders are used. Defaults to None.
            high (list with shape [3], optional): Delimits maximal borders of the box where the glyphs are seeded, if no value is supplied, the dataset borders are used. Defaults to None.
            size (float, optional): Default size of the glyphs. Defaults to 1.0.
            transparency (float, optional): Default transparency of the glyphs. Defaults to 1.0.

        Raises:
            NumflowException: [description]
        """
        if not self.dataset:
            raise NumflowException("Dataset needed.")

        seed_points = random_points(low, high, self.dataset, numSamples)

        values = self.dataset(seed_points)
        self.updateStats(values)
        glyphs = Glyphs(self.context.glyphProgram, seed_points, values, size, transparency)
        self.glyphs.append(glyphs)


    def add_slice(self, slice_coord, axis="x", resolution=[20, 20], low=None, high=None, transparency=1.0):
        """Adds colorcoded slice into the visualization. The slice 
        is always perpendicular to one of the main axes.

        Args:
            slice_coord (float): Plane coordinate along the perpendicular axis
            axis (str, optional): Perpendicular axis, possible values are "x", "y" or "z". Defaults to "x".
            resolution (list, optional): sampling resolution of the plane. Defaults to [20, 20].
            low (list with shape [3], optional): Delimits minimal borders of the box where the slice is constructed, if no value is supplied, the dataset borders are used. Defaults to None.
            high (list with shape [3], optional): Delimits maximal borders of the box where the slice is constructed, if no value is supplied, the dataset borders are used. Defaults to None.
            transparency (float, optional): Default transparency of the slice. Defaults to 1.0.

        Raises:
            NumflowException: Raises if there is no loaded dataset.
        """
        if not self.dataset:
            raise NumflowException("Dataset needed.")

        axis_id = ["x", "y", "z"].index(axis)

        start = self.dataset.low.copy() if low is None else np.amax([low, self.dataset.low], axis=0)
        end = self.dataset.high.copy() if high is None else np.amin([high, self.dataset.high], axis=0)
        start[axis_id] = slice_coord
        end[axis_id] = slice_coord
        resolution.insert(axis_id, 1)
        grid_points = regular_points(start, end, resolution)
        values = self.dataset(grid_points)
        self.updateStats(values)

        layer = Layer(self.context.sliceProgram, grid_points, values, resolution, axis_id, slice_coord, transparency)
        self.layers.append(layer)


    def add_streamline(self, t0, t_bound, numSamples=10, low=None, high=None, size=1.0, transparency=1.0):
        """Adds streamlines into the visualization, the streamlines are seeded inthe specified region, however, they can escape the original seeding area (as expected). The streamlines are randomly seeded in the seeding area. The integration is performed using custom C++ RK45 adaptive solver.

        Args:
            t0 (float): Initial time of the integration.
            t_bound (float): End time of the integration, the integration is also stopped at the borders of the dataset.
            numSamples (int, optional): Number of generated streamlines. Defaults to 10.
            low (list with shape [3], optional): Delimits minimal borders of the box where the streamlines are seeded, if no value is supplied, the dataset borders are used. Defaults to None.
            high (list with shape [3], optional): Delimits maximal borders of the box where the streamlines are seeded, if no value is supplied, the dataset borders are used. Defaults to None.
            size (float, optional): Thickness of the streamlines. Defaults to 1.0.
            transparency (float, optional): Transparency of the streamlines. Defaults to 1.0.

        Raises:
            NumflowException: [description]
        """
        if not self.dataset:
            raise NumflowException("Dataset needed.")

        seed_points = random_points(low, high, self.dataset, numSamples)

        abort = Event() #for compatibility...
        positions, values, lengths, times = cstreamlines(self.dataset, t0, t_bound, seed_points, abort)
        self.updateStats(values)
        streamline = Streamline(self.context.streamlineProgram, positions, values, lengths, times, size, transparency)
        self.streamlines.append(streamline)


    def gamma(self, value):
        """Adjusts colorbar with a gamma correction. For colormapping purpouses, the magnitudes inside the visualization are normalized between 0 (minimal magnitude, usually 0) and 1 (maximal magnitude) and then the gamma correction is applied. This approach can be used to highlite the difference between high or low values, which would normally be nearly indistinguishable. However, it is important to take into account that the gamma correction creates perceptually non-uniform color.

        real magnitude -> normalized magnitude (nm)
        colormap position = pow(nm, gamma)
        colormap position -> real color 

        Args:
            value (float): Gamma value
        """
        self.settings["gamma"] = max(value, 0)
        self.context.text.updateText("gamma: " + self.settings["gamma"] + " - change with U/I")


    def display(self):
        """Displays the rendering window with all primitives added earlier.
        """
        self.context.runLoop()


    #------------------------------------------------------------------------------------------------

    def run(self):
        """Internal function, should not be called from outside.
        """
        self.context.runLoop()


    def gamma_up(self):
        """Internal function, should not be called from outside.
        """
        self.settings["gamma"] += self.settings["gamma_incr"]
        self.context.textGamma.updateText(f"gamma: {self.settings['gamma']:2f} - change with U/I")


    def gamma_down(self):
        """Internal function, should not be called from outside.
        """
        self.settings["gamma"] = max(self.settings["gamma"] - self.settings["gamma_incr"], 0)
        self.context.textGamma.updateText(f"gamma: {self.settings['gamma']:2f} - change with U/I")


    def draw_transparent(self):
        """Internal function, should not be called from outside.
        """
        if self.camera is None:
            return

        #draw transparent stuff
        for box in self.boxes:
            if box.transparency < 1.0:
                box.draw(self.camera.view, self.camera.projection, self.settings)

        for glyph in self.glyphs:
            if glyph.transparency < 1.0:
                glyph.draw(self.camera.view, self.camera.projection, self.settings)
        
        for layer in self.layers:
            if layer.transparency < 1.0:
                layer.draw(self.camera.view, self.camera.projection, self.settings)

        for streamline in self.streamlines:
            if streamline.transparency < 1.0:
                streamline.draw(self.camera.view, self.camera.projection, self.settings)


    def draw_opaque(self):
        """Internal function, should not be called from outside.
        """
        
        if self.camera is None:
            return

        #draw opaque stuff
        for box in self.boxes:
            if box.transparency == 1.0:
                box.draw(self.camera.view, self.camera.projection, self.settings)

        for glyph in self.glyphs:
            if glyph.transparency == 1.0:
                glyph.draw(self.camera.view, self.camera.projection, self.settings)
        
        for layer in self.layers:
            if layer.transparency == 1.0:
                layer.draw(self.camera.view, self.camera.projection, self.settings)

        for streamline in self.streamlines:
            if streamline.transparency == 1.0:
                streamline.draw(self.camera.view, self.camera.projection, self.settings)

        # draw selection box
        self.selection.draw(self.camera.view, self.camera.projection, self.settings)


    def draw_colorbar(self):
        """Internal function, should not be called from outside.
        """

        #draws the colormap strip on the side
        self.colormap.draw(self.camera.width, self.camera.height, self.settings)


    def updateStats(self, values):
        """Internal function, should not be called from outside.
        """

        values[np.isnan(values)] = 0
        values[np.isnan(values)] = 0
        lengths = np.linalg.norm(values, axis=1)
        amin = np.amin(lengths)
        amax = np.amax(lengths)

        self.settings["min"] = min(self.settings["min"], amin)
        self.settings["max"] = max(self.settings["max"], amax)

        #if self.settings["max"] < self.settings["max_threshold"]:
        #    self.settings["max_threshold"] = self.settings["max"] 

        print(f"Visualization stataistics so far:")
        print(f"    min magnitude, {amin}")
        print(f"    max magnitude, {amax}")
        #print(f"min thresh, {self.settings['min_threshold']}")
        #print(f"max thresh, {self.settings['max_threshold']}")

    