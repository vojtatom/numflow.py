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

    string info()
    {
        string size = "Size: " + to_string(dx * dy * dz) + " elements";
        string shape = "Shape: " + to_string(dx) + " x " + to_string(dy) + " x " + to_string(dz);
        string memoryConsumed = "Memory consumed: " + to_string(sizeof(tfloat) * dx * dy * dz) + " bytes";
        string x_range = "X range: " + to_string(x_coords[0]) + " - " + to_string(x_coords[dx - 1]);
        string y_range = "Y range: " + to_string(y_coords[0]) + " - " + to_string(y_coords[dy - 1]);
        string z_range = "Z range: " + to_string(z_coords[0]) + " - " + to_string(z_coords[dz - 1]);
        return size + "\n" + shape + "\n" + memoryConsumed + "\n" + x_range + "\n" + y_range + "\n" + z_range;
    }

protected:
    bool prepare_coord_field(vector<pair<tvec3, tvec3>> &pos_val);
};
