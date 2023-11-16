#pragma once
#include "types.hpp"
#include "field.hpp"

py::array_t<tfloat> interpolate_3d(
    const shared_ptr<RectilinearField3D> dataset,
    const py::array_t<tfloat, py::array::c_style | py::array::forcecast> &points);

void interpolate_3d_single_point(const shared_ptr<RectilinearField3D> dataset, const tfloat points[3], tfloat out_values[3]);