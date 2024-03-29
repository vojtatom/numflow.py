import { Post } from "./Post";

import imgflow from "../images/flow.png";
import imgwholeimgtop from "../images/wholeimgtop.png";
import imgrenderer from "../images/renderer.png";
import imgpipeline from "../images/pipeline.png";
import imgmediumA from "../images/mediumA.png";
import imgmediumB from "../images/mediumB.png";
import imgmediumC from "../images/mediumC.png";
import imgglC from "../images/glC.png";
import imgglA from "../images/glA.png";
import imgglB from "../images/glB.png";

export function FlowPostPage() {
    return (
        <Post clickableImages title="vojtatom - flow">
            <h1>Vector field visualization</h1>
            <p className="subtitle">
                by <a href="http://vojtatom.cz">Vojtěch Tomas (@vojtatom)</a>,
                2017 (update 2023), vector field visualization
            </p>
            <p>
                I developed a prototype of{" "}
                <strong>
                    a framework for 3D visualization of vector field data
                </strong>
                . The main focus was the visualization of{" "}
                <strong>plasma flow near solar surface</strong>. It was
                originally a semestral project that I later developed into a{" "}
                <a href="https://dspace.cvut.cz/handle/10467/83382">
                    bachelor thesis
                </a>{" "}
                at FIT CTU in Prague in cooperation with{" "}
                <a href="https://www.asu.cas.cz/~sdsa/svanda.html">
                    Michal Švanda
                </a>{" "}
                and <a href="https://www.asu.cas.cz">ASU CAS</a>, supervisor
                Radek Richtr. The prototype was implemented using C++, Python,
                JavaScript and WebGL.
            </p>
            <div className="images">
                <img src={imgflow} alt="flow" />
            </div>
            <p className="figureDescription">
                visualization of plasma flow using streamlines and colored cut
                plane
            </p>
            <p>The final workflow is straightforward:</p>
            <ol>
                <li>
                    preprocess the data in python using our own{" "}
                    <span className="math">numflow</span> package
                </li>
                <li>viusalize the data using interactive web app</li>
            </ol>
            <h2>
                <span className="math">numflow</span> package
            </h2>
            <p>
                The <span className="math">numflow</span> package is mainly
                written in C++ and Python, the interoperability is ensured by
                pybind11.
            </p>
            <p>
                As supprted input format, I explored several options including
                FITS, several VTK formats, custom binary formats and plain CSVs.
                As mentioned, the project was developed in cooperation with ASU
                CAS, and using simple plain CSVs proved to be the most
                convenient - the time spent on debuging various parsers was not
                worth the time saved by using more efficient formats.
            </p>
            <h3>Input format</h3>
            <p>
                The package supports data aligned to rectiliner grids, however
                the input format was just a list of positions and velocities:
            </p>
            {/* prettier-ignore */}
            <pre>
                <span>x,     y,      z,      vx,    vy,    vz</span>
                <span>0.10,  0.10,   0.50,   0.20,  1.99,  0.50</span>
                <span>0.10,  0.10,  -0.58,   0.20,  1.99, -0.58</span>
                <span>0.10,  0.10,  -1.66,   0.20,  1.99, -1.66</span>
                <span>...</span>
                <span>60.00, 60.00, -17.84, -0.61, -1.90, -17.84</span>
                <span>60.00, 60.00, -18.92, -0.61, -1.90, -18.92</span>
                <span>60.00, 60.00, -20.00, -0.61, -1.90, -20.00</span>
            </pre>

            <h3>Visualizatoin methods</h3>
            <p>
                I made a short{" "}
                <a href="https://github.com/vojtatom/numflow.py/blob/main/sun-dataset.ipynb">
                    Python notebook with example pipeline
                </a>
                . The user can parse the data using the following code:
            </p>
            {/* prettier-ignore */}
            <pre>
                <span>from numflow import Dataset</span>
                <span>field = Dataset("path/to/data.csv")</span>
                <span>print(field.info())</span>
            </pre>
            <p>
                The package then exposes a visualization object, that can be
                used to preprocess the data:
            </p>
            {/* prettier-ignore */}
            <pre>
                <span>from numflow import Visualization, points, random_points</span>
                <span>vis = Visualization()</span>
            </pre>
            <div className="images">
                <img src={imgwholeimgtop} alt="flow" />
            </div>
            <p className="figureDescription">
                visualization of plasma flow using colored cut plane and
                streamlines
            </p>
            <p>The user can then use the visualization object to add layers:</p>
            {/* prettier-ignore */}
            <pre>
                <span># generate 1000x1000 points on plane</span>
                <span>layer_z = -10</span>
                <span>layer = points([20, 20, layer_z], [590, 590, layer_z], [1000, 1000, 1])</span>
                <span></span>
                <span># use those points to add a color-mapped layer (cut) to the visualization</span>
                <span>vis.layer(field, layer)</span>
            </pre>
            <p>
                One of the main features of the package is the ability to
                compute streamlines - the package includes a custom RK4 solver
                implemented in C++, which beats the performance of the SciPy
                Python implementation by several orders of magnitude (see{" "}
                <a href="https://dspace.cvut.cz/handle/10467/83382">thesis</a>).
            </p>
            {/* prettier-ignore */}
            <pre>
                <span># generate 200x200 points on plane</span>
                <span>layerS = points([20, 20, layer_z], [590, 590, layer_z], [200, 200, 1])</span>
                <span></span>
                <span># use those points as seeding points for streamlines</span>
                <span>vis.streamlines(field, layerS, tbound=0.01, size=0.2, appearance='transparent', sampling=3, divisions=3)</span>
            </pre>
            <div className="images">
                <img src={imgglC} alt="flow" />
            </div>
            <p className="figureDescription">
                visualization of plasma flow using glyphs
            </p>
            <p>
                The package also includes a simple glyph interpolator. Note that
                the seeding points are generated randomly:
            </p>
            {/* prettier-ignore */}
            <pre>
                <span># generate 200 * 200 * 10 random points on plane</span>
                <span>randomS = random_points([20, 20, layer_z], [590, 590, layer_z], 200 * 200 * 10)</span>
                <span></span>
                <span># use those points as seeding points for glyphs</span>
                <span>vis.glphys(field, randomS, size=0.2)</span>
            </pre>

            <p>At the end, the pre-processed data gets saved to a JSON file:</p>
            {/* prettier-ignore */}
            <pre>
                <span>vis.save("path/to/output.json")</span>
            </pre>

            <h2>WebGL application</h2>

            <div className="images">
                <img src={imgrenderer} alt="flow" />
            </div>
            <p className="figureDescription">
                WebGL application for visualization of plasma flow
            </p>

            <p>
                The application was written in plain JavaScript and WebGL, no
                libraries, no frameworks. It was a learning experience, and I
                wanted to understand the underlying principles. The application
                is capable of loading the JSON file and rendering the data. The
                application ran in the browser as well as in distributed
                environments such as SAGE2 wall.
            </p>

            <div className="images">
                <img src={imgpipeline} alt="flow" />
            </div>
            <p className="figureDescription">
                pipeline editor for defining the appearance of the layers
            </p>

            <p>
                The application also included a simple pipeline editor, where
                the user could define the used layers and their appearance.
                Combination of multiple data sources was also supported.
            </p>

            <h2>Additional outputs</h2>

            <div className="imageGrid">
                <img src={imgglA} alt="flow" />
                <img src={imgglB} alt="flow" />
            </div>

            <div className="imageGrid">
                <img src={imgmediumC} alt="flow" />
            </div>

            <div className="imageGrid">
                <img src={imgmediumA} alt="flow" />
                <img src={imgmediumB} alt="flow" />
            </div>

            <h2>Conclusion</h2>
            <p>
                If you are interested in the project, you can find the source
                code on{" "}
                <a href="https://github.com/vojtatom/numflow.py">
                    GitHub (numflow.py)
                </a>{" "}
                and my bachelor thesis on{" "}
                <a href="https://dspace.cvut.cz/handle/10467/83382">
                    DSpace CVUT
                </a>
                . I intend to release the <span className="math">numflow</span>{" "}
                package as a standalone library to PyPI (currently work in
                progress - last update Dec 2023). Regarding the WebGL
                application, the{" "}
                <a href="https://github.com/vojtatom/numflow.py/tree/main/docs/app">
                    source code
                </a>{" "}
                is available as well, since it is bare JavaScript, it still
                works; however, I don't plan to maintain it. It would be
                interesting to reimplement the application using modern tools
                and libraries. Also mail me or tweet{" "}
                <a href="https://twitter.com/vojtatom">@vojtatom (me)</a> if you
                decide to make something based on this!
            </p>
        </Post>
    );
}
