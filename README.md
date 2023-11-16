# Numflow

C++ based tool for converting vector field data into models for rendering.
Currently work in progress.

* Doc: VTK file formats https://kitware.github.io/vtk-examples/site/VTKFileFormats/#unstructuredgrid

## Dev
Developing the package on localhost is recommanded in devcontainer - see `.devcontainer` folder.
The deps are in `pyproject.toml`, you can build the package:

```
pip install .
```

The install uses pyproject.toml to install the deps, and the setup.py to install the package. For local dev, you can instlal the dependencies with:

```
pip install -r requirements.txt
```

Run the tests:
```
pytest
```

