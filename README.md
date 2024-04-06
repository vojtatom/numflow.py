# Numflow

Python/C++ based tool for converting vector field data into models for rendering.

I made a [blogpost describing the design, there are also some outputs, see more here!](https://vojtatom.github.io/numflow.py)

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
