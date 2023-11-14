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

Run the tests:

```
pytest
```