#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/functional.h>
#include <pybind11/numpy.h>
#include "field.hpp"
#include "integrate.hpp"
#include "interpolate.hpp"

namespace py = pybind11;
using namespace std;

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
        .def("velocities", &RectilinearField3D::get_velocities)
        .def("info", &RectilinearField3D::info);

    py::class_<DataStreamlines, std::shared_ptr<DataStreamlines>>(m, "DataStreamlines")
        .def(py::init<>())
        .def("y", &DataStreamlines::get_y)
        .def("f", &DataStreamlines::get_f)
        .def("t", &DataStreamlines::get_t)
        .def("l", &DataStreamlines::get_l);

    m.def("interpolate_3d", &interpolate_3d, py::return_value_policy::take_ownership);
    m.def("integrate_3d", &integrate_3d);
}
