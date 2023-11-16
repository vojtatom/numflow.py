#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/functional.h>
#include <pybind11/numpy.h>
#include "field.hpp"
#include "integrate.hpp"
#include "interpolate.hpp"

#define TINYGLTF_IMPLEMENTATION
#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "deps/gltf/tiny_gltf.h"

namespace py = pybind11;
using namespace std;

// TODO
// https://pybind11.readthedocs.io/en/stable/advanced/pycpp/numpy.html

PYBIND11_MODULE(compute, m)
{
    py::class_<RectilinearField3D, std::shared_ptr<RectilinearField3D>>(m, "RectilinearField3D")
        .def(py::init<const string &>())
        .def("x_coords", &RectilinearField3D::get_x_coords)
        .def("y_coords", &RectilinearField3D::get_y_coords)
        .def("z_coords", &RectilinearField3D::get_z_coords)
        .def("dx", &RectilinearField3D::get_dx)
        .def("dy", &RectilinearField3D::get_dy)
        .def("dz", &RectilinearField3D::get_dz)
        .def("velocities", &RectilinearField3D::get_velocities);

    py::class_<DataStreamlines, std::shared_ptr<DataStreamlines>>(m, "DataStreamlines")
        .def(py::init<>())
        .def_readonly("y", &DataStreamlines::y)
        .def_readonly("f", &DataStreamlines::f)
        .def_readonly("t", &DataStreamlines::t)
        .def_readonly("l", &DataStreamlines::l);

    m.def("interpolate_3d", &interpolate_3d);
    m.def("integrate_3d", &integrate_3d);
}
