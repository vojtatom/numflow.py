#pragma once
#include "types.hpp"
#include "field.hpp"

vector<tfloat> interpolate_3d(const shared_ptr<RectilinearField3D> dataset, const vector<tfloat> &points);
void interpolate_3d_single_point(const shared_ptr<RectilinearField3D> dataset, const tfloat points[3], tfloat out_values[3]);