from importlib.metadata import requires
import sys

try:
    from skbuild import setup
except ImportError:
    print(
        "Please update pip, you need pip 10 or greater,\n"
        " or you need to install the PEP 518 requirements in pyproject.toml yourself",
        file=sys.stderr,
    )
    raise

from setuptools import find_packages
import pathlib

# The directory containing this file
HERE = pathlib.Path(__file__).parent
# The text of the README file
README = (HERE / "README.md").read_text()

setup(
    name="numflow",
    version="1.0.0",
    author="Vojtěch Tomas",
	author_email="hello@vojtatom.cz",
    license="MIT",
    description="Transforming vector fields",
    long_description=README,
    long_description_content_type="text/markdown",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    cmake_install_dir="src/numflow",
    #include_package_data=True,
    url="https://github.com/vojtatom/numflow.py",
    python_requires='>=3.8',
    classifiers=[
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
    ]
)