#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/functional.h>
#include "field.hpp"
#include "integrate.hpp"
#include "interpolate.hpp"

#define TINYGLTF_IMPLEMENTATION
#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "deps/gltf/tiny_gltf.h"

namespace py = pybind11;
using namespace std;

PYBIND11_MODULE(compute, m)
{
    py::class_<RectilinearField3D, std::shared_ptr<RectilinearField3D>>(m, "RectilinearField3D")
        .def(py::init<const string &>());

    py::class_<DataStreamlines, std::shared_ptr<DataStreamlines>>(m, "DataStreamlines")
        .def(py::init<>())
        .def_readwrite("y", &DataStreamlines::y)
        .def_readwrite("f", &DataStreamlines::f)
        .def_readwrite("t", &DataStreamlines::t)
        .def_readwrite("l", &DataStreamlines::l);

    m.def("interpolate_3d", &interpolate_3d);
    m.def("integrate_3d", &integrate_3d);
}
