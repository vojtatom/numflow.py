# Numflow

Python/C++ based tool for converting vector field data into models for rendering.

I made a [blogpost describing the design, there are also some outputs, see more here!](https://vojtatom.github.io/numflow.py)

The package is available on [PyPI](https://pypi.org/project/numflow/), you can install it with:

```
pip install numflow
```

There are pre-compiled wheels available for Windows, Linux and MacOS, no need to compile the C++ code yourself.

## Dev

Developing the package on localhost is recommanded in devcontainer - see `.devcontainer` folder.
The deps are in `pyproject.toml`, you can build the package:

```
pip install .
```

The install uses pyproject.toml to install the deps, and the setup.py to install the package. For local dev, you can install the dependencies with:

```
pip install -r requirements.txt
```

Run the tests:

```
pytest
```
