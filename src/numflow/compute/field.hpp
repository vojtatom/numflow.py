#pragma once
#include "types.hpp"
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/functional.h>
#include <pybind11/numpy.h>

using namespace std;
namespace py = pybind11;

class RectilinearField3D
{
public:
    RectilinearField3D(const string &filename);

    py::memoryview get_x_coords()
    {
        return py::memoryview::from_buffer(
            x_coords.data(),
            {dx},
            {sizeof(tfloat)});
    };

    py::memoryview get_y_coords()
    {
        return py::memoryview::from_buffer(
            y_coords.data(),
            {dy},
            {sizeof(tfloat)});
    };

    py::memoryview get_z_coords()
    {
        return py::memoryview::from_buffer(
            z_coords.data(),
            {dz},
            {sizeof(tfloat)});
    };

    py::memoryview get_velocities()
    {
        return py::memoryview::from_buffer(
            velocities.data(),
            {dx, dy, dz},
            {sizeof(tfloat) * dy * dz, sizeof(tfloat) * dz, sizeof(tfloat)});
    };

    int32_t get_dx()
    {
        return dx;
    };

    int32_t get_dy()
    {
        return dy;
    };

    int32_t get_dz()
    {
        return dz;
    };

    // coordinates, formerly  *ax, *ay, *az;
    vector<tfloat> x_coords, y_coords, z_coords;

    // axis sizes
    int32_t dx, dy, dz;

    // in field, z is the fastest changing coordinate
    // formerly *data;
    vector<tfloat> velocities;

protected:
    bool prepare_coord_field(vector<pair<tvec3, tvec3>> &pos_val);
};
